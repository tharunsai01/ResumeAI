/**
 * Resume processing pipeline. Each stage is written to the database before it
 * starts, so the progress shown to the candidate is the real processing state.
 */
import fs from 'node:fs/promises';
import { env } from '../config/env';
import { CandidateProfile, Resume, Skill } from '../models';
import type { ResumeStage } from '../constants';
import { safeJoin } from '../utils/fileSecurity';
import { logger } from '../utils/logger';
import { aiClient } from './aiClient';
import { audit, notify, notifyAdmins } from './audit';
import { customSkills } from './matching';

async function setStage(id: string, stage: ResumeStage, extra: Record<string, unknown> = {}) {
  await Resume.updateOne({ _id: id }, { $set: { status: stage, ...extra }, $push: { stageHistory: { stage, at: new Date() } } });
}

export async function processResume(resumeId: string): Promise<void> {
  const started = Date.now();
  const resume = await Resume.findById(resumeId).select('+storedName candidate originalName fileType');
  if (!resume) return;
  const candidateId = String(resume.candidate);
  try {
    await setStage(resumeId, 'validating');
    const filePath = safeJoin(env.UPLOAD_DIR, candidateId, resume.storedName);
    const buffer = await fs.readFile(filePath);

    await setStage(resumeId, 'extracting');
    const extracted = await aiClient.extractText(buffer, `resume.${resume.fileType}`);
    await Resume.updateOne({ _id: resumeId }, { $set: { text: extracted.text } });

    const custom = await customSkills();
    await setStage(resumeId, 'detecting_skills');
    const skills = await aiClient.skills(extracted.text, custom);

    await setStage(resumeId, 'analysing_experience');
    await aiClient.profile(extracted.text);

    await setStage(resumeId, 'generating_report');
    const report = await aiClient.report(extracted.text, extracted.hidden_text, custom);
    report.document = { file_type: extracted.file_type, pages: extracted.pages, truncated: extracted.truncated, characters: extracted.text.length };

    // Take the higher of the two scans (file-level scan sees hidden text spans directly)
    const security = (extracted.security?.risk_score ?? 0) > (report.security?.risk_score ?? 0) ? extracted.security : report.security;
    const flagged = !!security?.flagged;

    await setStage(resumeId, 'completed', {
      analysis: report,
      security: { riskScore: security?.risk_score ?? 0, riskLevel: security?.risk_level ?? 'none', flagged, findings: security?.findings ?? [] },
      reviewStatus: flagged ? 'pending' : 'none',
      processingMs: Date.now() - started,
      error: undefined,
    });

    // Unknown skills go to the admin taxonomy review queue
    for (const name of (skills.unknown_skills ?? []).slice(0, 20)) {
      await Skill.updateOne(
        { name },
        { $setOnInsert: { name, status: 'pending', source: 'resume', category: 'Other' }, $inc: { occurrences: 1 } },
        { upsert: true },
      ).catch(() => undefined);
    }

    // First successful resume becomes active automatically
    const profile = await CandidateProfile.findOne({ user: candidateId });
    if (profile && !profile.activeResume) {
      profile.activeResume = resume._id;
      await profile.save();
      await Resume.updateOne({ _id: resumeId }, { isActive: true });
    }

    if (flagged) {
      await audit(null, {
        action: 'resume.flagged',
        category: 'ai_security',
        severity: security.risk_level === 'high' ? 'critical' : 'warning',
        targetType: 'Resume',
        targetId: resumeId,
        actor: { id: candidateId, role: 'candidate' },
        metadata: { riskScore: security.risk_score, findings: (security.findings ?? []).map((f: any) => f.type) },
      });
      await notifyAdmins({ type: 'security', title: 'Resume flagged for review', message: `Possible prompt-injection content (risk ${security.risk_score}).`, link: '/admin/security' });
    }
    await notify(candidateId, {
      type: 'resume',
      title: 'Resume analysis complete',
      message: flagged
        ? 'Your resume was analysed and sent for a routine manual review.'
        : `Found ${report.profile?.skills?.length ?? 0} skills and ${report.profile?.total_experience_years ?? 0} years of experience.`,
      link: '/candidate/resumes',
    });
  } catch (err) {
    const message = (err as Error).message?.slice(0, 280) || 'Processing failed';
    logger.warn({ resumeId, message }, 'Resume processing failed');
    await setStage(resumeId, 'failed', { error: message, processingMs: Date.now() - started });
    await notify(candidateId, { type: 'resume', title: 'Resume processing failed', message, link: '/candidate/resumes' });
  }
}
