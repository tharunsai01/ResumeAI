/**
 * Full API journey against a real MongoDB (set MONGO_URI_TEST). The AI
 * microservice is replaced with a deterministic stub so this suite tests the
 * backend's own behaviour; the AI service has its own pytest suite.
 */
import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { connectDatabase } from '../../src/config/db';
import { User } from '../../src/models';

const MONGO = process.env.MONGO_URI_TEST;

vi.mock('../../src/services/aiClient', () => {
  const match = (cand: any, job: any) => {
    const req: string[] = job.required_skills ?? [];
    const have = new Set((cand.skills ?? []).map((s: string) => s.toLowerCase()));
    const skills = req.length ? (req.filter((s) => have.has(s.toLowerCase())).length / req.length) * 100 : 100;
    const components = { skills: Math.round(skills * 100) / 100, experience: 100, education: 100, role: 60 };
    const overall = Math.round((components.skills * 0.5 + 20 + 10 + 12) * 100) / 100;
    return {
      candidate_id: cand.id, job_id: job.id, overall_score: overall, components,
      category: overall >= 80 ? 'Strong Match' : overall >= 60 ? 'Potential Match' : 'Low Match',
      matched_skills: [], related_skills: [], missing_skills: [], strengths: [], gaps: [], explanation: 'stub', recommendations: [],
      details: {}, model_version: 'stub', embedding_backend: 'stub', llm_used: false, validated: true, timestamp: new Date().toISOString(),
    };
  };
  return {
    aiClient: {
      health: async () => ({ status: 'ok', model_version: 'stub' }),
      extractText: async () => ({ text: 'Skills: React, Node.js', file_type: 'pdf', pages: 1, truncated: false, hidden_text: [], security: { risk_score: 0, flagged: false, findings: [] } }),
      skills: async () => ({ skills: [{ name: 'React' }], unknown_skills: ['QuantumWidgets'] }),
      profile: async () => ({}),
      report: async () => ({ profile: { skills: [{ name: 'React', category: 'Frontend' }, { name: 'Node.js', category: 'Backend' }], total_experience_years: 3, job_titles: ['Engineer'], experience: [], education: [] }, security: { risk_score: 0, flagged: false, findings: [] } }),
      extractJob: async () => ({ required_skills: ['React'], preferred_skills: [], security: { flagged: false, risk_score: 0, findings: [] } }),
      match: async (p: any) => match(p.candidate, p.job),
      screen: async (p: any) => ({ count: p.candidates.length, results: p.candidates.map((c: any) => match(c, p.job)) }),
      recommend: async (p: any) => ({ results: p.jobs.map((j: any) => match(p.candidate, j)) }),
      skillGap: async () => ({ gaps: [], learning_recommendations: [] }),
      evaluate: async () => ({ candidate_count: 2, score_distribution: { mean: 70 }, counterfactual_fairness: { passed: true }, stability: { passed: true }, formula_validation: { all_valid: true }, adverse_impact: null, model_comparison: { active_backend: 'stub' } }),
    },
  };
});

describe.skipIf(!MONGO)('HireSmart end-to-end API journey', () => {
  let app: any;
  const agent = () => request(app);
  const tokens: Record<string, string> = {};
  let jobId = '';
  let applicationId = '';
  let candidateId = '';

  beforeAll(async () => {
    await connectDatabase(MONGO!);
    await mongoose.connection.db!.dropDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  });

  it('1. recruiter registers', async () => {
    const res = await agent().post('/api/v1/auth/register').send({ name: 'Rita Recruiter', email: 'rita@test.dev', password: 'Recruit3r!', role: 'recruiter', company: 'Acme' });
    expect(res.status).toBe(201);
    expect(res.headers['set-cookie'][0]).toMatch(/hs_refresh=.*HttpOnly/i);
    tokens.recruiter = res.body.data.accessToken;
  });

  it('2. recruiter creates and publishes a job', async () => {
    const res = await agent().post('/api/v1/jobs').set('Authorization', `Bearer ${tokens.recruiter}`).send({
      title: 'React Engineer', description: 'Build React and Node.js features for our product team.', requiredSkills: ['React', 'Node.js'], minExperienceYears: 2, workMode: 'remote', publish: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('published');
    jobId = res.body.data._id;
  });

  it('3. candidate registers with an empty profile', async () => {
    const res = await agent().post('/api/v1/auth/register').send({ name: 'Cora Candidate', email: 'cora@test.dev', password: 'Candid4te!', role: 'candidate' });
    expect(res.status).toBe(201);
    tokens.candidate = res.body.data.accessToken;
    candidateId = res.body.data.user._id;
    const profile = await agent().get('/api/v1/candidates/me').set('Authorization', `Bearer ${tokens.candidate}`);
    expect(profile.body.data.skills).toEqual([]);
    expect(profile.body.data.headline).toBe('');
  });

  it('4-6. candidate uploads a resume; pipeline records real stages; extracted data applied', async () => {
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
    const up = await agent().post('/api/v1/resumes').set('Authorization', `Bearer ${tokens.candidate}`).attach('file', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(up.status).toBe(202);
    let status = '';
    let body: any;
    for (let i = 0; i < 40 && status !== 'completed' && status !== 'failed'; i++) {
      await new Promise((r) => setTimeout(r, 100));
      body = (await agent().get(`/api/v1/resumes/${up.body.data._id}`).set('Authorization', `Bearer ${tokens.candidate}`)).body.data;
      status = body.status;
    }
    expect(status).toBe('completed');
    expect(body.stageHistory.map((s: any) => s.stage)).toEqual(['uploaded', 'validating', 'extracting', 'detecting_skills', 'analysing_experience', 'generating_report', 'completed']);
    const applied = await agent().post(`/api/v1/resumes/${up.body.data._id}/apply-to-profile`).set('Authorization', `Bearer ${tokens.candidate}`).send({});
    expect(applied.body.data.skills.map((s: any) => s.name)).toEqual(['React', 'Node.js']);
  });

  it('rejects a disguised executable upload', async () => {
    const res = await agent().post('/api/v1/resumes').set('Authorization', `Bearer ${tokens.candidate}`).attach('file', Buffer.from('MZ\x90\x00binarybinary'), { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
  });

  it('7-8. candidate discovers jobs and gets a validated match', async () => {
    const list = await agent().get('/api/v1/jobs?q=react').set('Authorization', `Bearer ${tokens.candidate}`);
    expect(list.body.data).toHaveLength(1);
    const match = await agent().get(`/api/v1/matching/jobs/${jobId}`).set('Authorization', `Bearer ${tokens.candidate}`);
    expect(match.status).toBe(200);
    expect(match.body.data.overallScore).toBe(92);
    expect(match.body.data.validated).toBe(true);
  });

  it('9. candidate applies (once)', async () => {
    const res = await agent().post('/api/v1/applications').set('Authorization', `Bearer ${tokens.candidate}`).send({ jobId, coverLetter: 'Hello' });
    expect(res.status).toBe(201);
    applicationId = res.body.data._id;
    expect(res.body.data.matchScore).toBe(92);
    const again = await agent().post('/api/v1/applications').set('Authorization', `Bearer ${tokens.candidate}`).send({ jobId });
    expect(again.status).toBe(409);
  });

  it('enforces RBAC between roles', async () => {
    expect((await agent().post('/api/v1/jobs').set('Authorization', `Bearer ${tokens.candidate}`).send({})).status).toBe(403);
    expect((await agent().get('/api/v1/admin/users').set('Authorization', `Bearer ${tokens.recruiter}`)).status).toBe(403);
  });

  it('10-12. recruiter views, screens and shortlists', async () => {
    const list = await agent().get(`/api/v1/applications?jobId=${jobId}`).set('Authorization', `Bearer ${tokens.recruiter}`);
    expect(list.body.data).toHaveLength(1);
    const run = await agent().post(`/api/v1/screening/jobs/${jobId}/run`).set('Authorization', `Bearer ${tokens.recruiter}`);
    expect(run.body.data.screened).toBe(1);
    const results = await agent().get(`/api/v1/screening/jobs/${jobId}`).set('Authorization', `Bearer ${tokens.recruiter}`);
    expect(results.body.data.results[0].status).toBe('screened');
    const bad = await agent().patch(`/api/v1/applications/${applicationId}/status`).set('Authorization', `Bearer ${tokens.recruiter}`).send({ status: 'hired' });
    expect(bad.status).toBe(400);
    const ok = await agent().patch(`/api/v1/applications/${applicationId}/status`).set('Authorization', `Bearer ${tokens.recruiter}`).send({ status: 'shortlisted', note: 'Strong React' });
    expect(ok.body.data.status).toBe('shortlisted');
  });

  it('13-14. recruiter schedules an interview; candidate is notified', async () => {
    const res = await agent().post('/api/v1/interviews').set('Authorization', `Bearer ${tokens.recruiter}`).send({ applicationId, scheduledAt: new Date(Date.now() + 86400000).toISOString(), type: 'video', meetingUrl: 'https://meet.example.com/abc' });
    expect(res.status).toBe(201);
    const notes = await agent().get('/api/v1/notifications').set('Authorization', `Bearer ${tokens.candidate}`);
    expect(notes.body.data.some((n: any) => n.type === 'interview')).toBe(true);
    const apps = await agent().get('/api/v1/applications/me').set('Authorization', `Bearer ${tokens.candidate}`);
    expect(apps.body.data[0].status).toBe('interview');
  });

  it('15. administrator reviews platform activity and can suspend users', async () => {
    await User.create({ name: 'Ada Admin', email: 'ada@test.dev', role: 'admin', passwordHash: await bcrypt.hash('Adm1nPass!', 4) });
    const login = await agent().post('/api/v1/auth/login').send({ email: 'ada@test.dev', password: 'Adm1nPass!' });
    tokens.admin = login.body.data.accessToken;
    const stats = await agent().get('/api/v1/admin/analytics').set('Authorization', `Bearer ${tokens.admin}`);
    expect(stats.body.data.totals).toMatchObject({ candidates: 1, recruiters: 1, applications: 1, interviews: 1 });
    const audit = await agent().get('/api/v1/admin/audit-logs?category=auth').set('Authorization', `Bearer ${tokens.admin}`);
    expect(audit.body.data.length).toBeGreaterThan(0);
    const sus = await agent().patch(`/api/v1/admin/users/${candidateId}/suspend`).set('Authorization', `Bearer ${tokens.admin}`).send({ reason: 'Test suspension' });
    expect(sus.body.data.status).toBe('suspended');
    expect((await agent().get('/api/v1/candidates/me').set('Authorization', `Bearer ${tokens.candidate}`)).status).toBe(403);
    await agent().patch(`/api/v1/admin/users/${candidateId}/reactivate`).set('Authorization', `Bearer ${tokens.admin}`);
  });

  it('rotates refresh tokens and detects reuse', async () => {
    const login = await agent().post('/api/v1/auth/login').send({ email: 'rita@test.dev', password: 'Recruit3r!' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const first = await agent().post('/api/v1/auth/refresh').set('Cookie', cookie).set('X-Requested-With', 'HireSmart');
    expect(first.status).toBe(200);
    const reuse = await agent().post('/api/v1/auth/refresh').set('Cookie', cookie).set('X-Requested-With', 'HireSmart');
    expect(reuse.status).toBe(401);
    const newCookie = first.headers['set-cookie'][0].split(';')[0];
    const afterReuse = await agent().post('/api/v1/auth/refresh').set('Cookie', newCookie).set('X-Requested-With', 'HireSmart');
    expect(afterReuse.status).toBe(401); // whole family revoked
  });

  it('locks accounts after repeated failures', async () => {
    for (let i = 0; i < 5; i++) await agent().post('/api/v1/auth/login').send({ email: 'cora@test.dev', password: 'wrong' });
    const res = await agent().post('/api/v1/auth/login').send({ email: 'cora@test.dev', password: 'Candid4te!' });
    expect(res.status).toBe(429);
  });
});
