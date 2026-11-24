import { describe, expect, it } from 'vitest';
import { canTransition, MATCH_WEIGHTS } from '../../src/constants';
import { stripOperators } from '../../src/middleware/security';
import { categoryFor, verifyOfficialScore } from '../../src/services/matching';
import { detectFileType, safeJoin, sanitizeDisplayName } from '../../src/utils/fileSecurity';
import { generateRefreshToken, hashToken, signAccessToken, verifyAccessToken } from '../../src/utils/tokens';
import { createJobSchema, registerSchema, updateJobSchema, updateSkillSchema } from '../../src/validators/schemas';

describe('file security', () => {
  it('detects PDF and DOCX by magic bytes only', () => {
    expect(detectFileType(Buffer.from('%PDF-1.7\n...........'))).toBe('pdf');
    const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('....word/document.xml....')]);
    expect(detectFileType(docx)).toBe('docx');
    const otherZip = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('....xl/workbook.xml....')]);
    expect(detectFileType(otherZip)).toBeNull();
    expect(detectFileType(Buffer.from('MZ\x90\x00 an executable pretending'))).toBeNull();
    expect(detectFileType(Buffer.from('<html><script>'))).toBeNull();
  });

  it('blocks path traversal', () => {
    expect(() => safeJoin('uploads', '..', 'etc', 'passwd')).toThrow(/traversal/);
    expect(() => safeJoin('uploads', 'user', '../../secret')).toThrow(/traversal/);
    expect(safeJoin('uploads', 'abc', 'file.pdf')).toMatch(/uploads[/\\]abc[/\\]file\.pdf$/);
  });

  it('sanitises display names', () => {
    expect(sanitizeDisplayName('../../evil<script>.pdf')).toBe('evil_script_.pdf');
    expect(sanitizeDisplayName('')).toBe('resume');
  });

  it('strips NoSQL operators and prototype keys from bodies', () => {
    const input = JSON.parse('{"email":{"$ne":null},"a.b":1,"__proto__":{"x":1},"nested":[{"$where":"1"}],"ok":"yes"}');
    expect(stripOperators(input)).toEqual({ email: {}, nested: [{}], ok: 'yes' });
  });
});

describe('tokens', () => {
  it('round-trips access tokens and rejects tampering', () => {
    const t = signAccessToken({ sub: 'abc', role: 'candidate' });
    expect(verifyAccessToken(t)).toEqual({ sub: 'abc', role: 'candidate' });
    expect(() => verifyAccessToken(t.slice(0, -2) + 'xx')).toThrow();
  });

  it('stores only a keyed hash of refresh tokens', () => {
    const { token, hash } = generateRefreshToken();
    expect(token.length).toBeGreaterThan(50);
    expect(hash).toBe(hashToken(token));
    expect(hash).not.toContain(token);
  });
});

describe('matching validation', () => {
  it('uses the official weights', () => {
    expect(MATCH_WEIGHTS).toEqual({ skills: 0.5, experience: 0.2, education: 0.1, role: 0.2 });
    expect(Object.isFrozen(MATCH_WEIGHTS)).toBe(true);
  });

  it('independently re-checks AI scores', () => {
    const components = { skills: 80, experience: 100, education: 50, role: 70 };
    expect(verifyOfficialScore({ overall_score: 79, components, category: 'Potential Match' })).toBe(true);
    expect(verifyOfficialScore({ overall_score: 95, components, category: 'Strong Match' })).toBe(false);
    expect(verifyOfficialScore({ overall_score: 79, components, category: 'Strong Match' })).toBe(false);
    expect(verifyOfficialScore({ overall_score: 50, components: { ...components, skills: 140 }, category: 'Low Match' })).toBe(false);
  });

  it('categorises scores', () => {
    expect(categoryFor(80)).toBe('Strong Match');
    expect(categoryFor(79.99)).toBe('Potential Match');
    expect(categoryFor(59.99)).toBe('Low Match');
  });
});

describe('pipeline rules', () => {
  it('allows only defined transitions', () => {
    expect(canTransition('applied', 'shortlisted')).toBe(true);
    expect(canTransition('shortlisted', 'interview')).toBe(true);
    expect(canTransition('applied', 'hired')).toBe(false);
    expect(canTransition('hired', 'rejected')).toBe(false);
    expect(canTransition('withdrawn', 'applied')).toBe(false);
  });
});

describe('validators', () => {
  it('enforces password strength and blocks admin self-registration', () => {
    expect(registerSchema.safeParse({ name: 'Al', email: 'a@b.co', password: 'weak', role: 'candidate' }).success).toBe(false);
    expect(registerSchema.safeParse({ name: 'Al', email: 'a@b.co', password: 'Strong123', role: 'admin' }).success).toBe(false);
    const ok = registerSchema.safeParse({ name: 'Al', email: 'A@B.co', password: 'Strong123', role: 'recruiter' });
    expect(ok.success && ok.data.email).toBe('a@b.co');
  });

  it('rejects inverted salary ranges and dedupes skills', () => {
    const base = { title: 'Engineer', description: 'x'.repeat(40), requiredSkills: ['React', 'React'] };
    expect(createJobSchema.safeParse({ ...base, salary: { min: 10, max: 5 } }).success).toBe(false);
    const parsed = createJobSchema.parse(base);
    expect(parsed.requiredSkills).toEqual(['React']);
  });

  it('partial updates never inject defaults over existing values', () => {
    expect(updateJobSchema.parse({ title: 'New title' })).toEqual({ title: 'New title' });
    expect(updateSkillSchema.parse({ status: 'approved' })).toEqual({ status: 'approved' });
    expect(createJobSchema.parse({ title: 'Engineer', description: 'x'.repeat(40) }).workMode).toBe('onsite');
  });
});
