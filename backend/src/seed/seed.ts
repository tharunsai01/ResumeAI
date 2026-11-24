/**
 * Development seed data. Every person and company here is fictional.
 * Usage: npm run seed            (adds missing records)
 *        npm run seed -- --reset (wipes HireSmart collections first; dev only)
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env, isProd } from '../config/env';
import { connectDatabase } from '../config/db';
import { Application, AuditLog, CandidateProfile, Job, Notification, RecruiterProfile, Skill, User } from '../models';
import { matchCandidateToJob } from '../services/matching';
import { logger } from '../utils/logger';
import skills from './skills.json';

export const SEED_PASSWORD = 'HireSmart@2026';

const RECRUITERS: Array<{ name: string; email: string; company: string; title: string; industry: string; companySize: '' | '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'; location: string }> = [
  { name: 'Maya Lindqvist', email: 'maya.recruiter@hiresmart.dev', company: 'Northwind Analytics', title: 'Senior Talent Partner', industry: 'Software', companySize: '201-1000', location: 'Bengaluru, India' },
  { name: 'Daniel Osei', email: 'daniel.recruiter@hiresmart.dev', company: 'Bluefin Health', title: 'Technical Recruiter', industry: 'Healthcare Technology', companySize: '51-200', location: 'Remote' },
];

const y = (n: number) => new Date(new Date().getFullYear() - n, 0, 1);

const CANDIDATES = [
  {
    name: 'Alex Moreno', email: 'alex.candidate@hiresmart.dev', headline: 'Full-Stack Engineer (React, Node.js)', location: 'Pune, India', openToRecruiters: true,
    summary: 'Full-stack engineer who builds SaaS dashboards and REST APIs. Comfortable owning features from database schema to UI.',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Jest', 'Git', 'REST APIs', 'Tailwind CSS'],
    experience: [{ title: 'Software Engineer', company: 'Kestrel Apps', startDate: y(4), current: true, description: 'React + Node.js product team.' }],
    education: [{ institution: 'Savitribai Phule Pune University', degree: 'B.E. Computer Engineering', field: 'Computer Engineering', level: 3, endYear: new Date().getFullYear() - 4 }],
    years: 4,
  },
  {
    name: 'Priya Raman', email: 'priya.candidate@hiresmart.dev', headline: 'Machine Learning Engineer', location: 'Chennai, India', openToRecruiters: true,
    summary: 'ML engineer focused on NLP and model deployment. Ships Python services and evaluation pipelines.',
    skills: ['Python', 'PyTorch', 'scikit-learn', 'Natural Language Processing', 'Pandas', 'FastAPI', 'Docker', 'SQL', 'MLOps'],
    experience: [{ title: 'Machine Learning Engineer', company: 'Lumen Labs', startDate: y(3), current: true, description: 'NLP classification and ranking models.' }, { title: 'Data Analyst', company: 'Orbit Retail', startDate: y(5), endDate: y(3), description: 'SQL reporting.' }],
    education: [{ institution: 'Anna University', degree: 'M.Tech Data Science', field: 'Data Science', level: 4, endYear: new Date().getFullYear() - 5 }],
    years: 5,
  },
  {
    name: 'Sam Whitfield', email: 'sam.candidate@hiresmart.dev', headline: 'Junior Frontend Developer', location: 'Remote', openToRecruiters: false,
    summary: 'Frontend developer with a design background, building accessible React interfaces.',
    skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Figma', 'Accessibility', 'Git'],
    experience: [{ title: 'Frontend Developer', company: 'Pixel & Pine', startDate: y(1), current: true, description: 'Marketing sites and component libraries.' }],
    education: [{ institution: 'Online bootcamp', degree: 'Diploma in Web Development', field: 'Web Development', level: 2, endYear: new Date().getFullYear() - 1 }],
    years: 1,
  },
  {
    name: 'Chen Wei', email: 'chen.candidate@hiresmart.dev', headline: 'DevOps Engineer', location: 'Hyderabad, India', openToRecruiters: true,
    summary: 'DevOps engineer running Kubernetes platforms and CI/CD for product teams.',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Jenkins', 'GitHub Actions', 'Linux', 'Bash', 'Monitoring', 'Go'],
    experience: [{ title: 'DevOps Engineer', company: 'Cirrus Cloudworks', startDate: y(6), current: true, description: 'EKS platform, Terraform modules.' }],
    education: [{ institution: 'Osmania University', degree: 'B.Tech Information Technology', field: 'Information Technology', level: 3, endYear: new Date().getFullYear() - 6 }],
    years: 6,
  },
];

type SeedJob = { r: number; title: string; workMode: 'remote' | 'hybrid' | 'onsite'; location: string; required: string[]; preferred: string[]; years: number; edu: number; salary: [number, number, string]; description: string };
const JOBS: SeedJob[] = [
  { r: 0, title: 'Senior Full-Stack Engineer', workMode: 'hybrid', location: 'Bengaluru, India', required: ['React', 'Node.js', 'TypeScript', 'MongoDB'], preferred: ['Docker', 'AWS', 'GraphQL'], years: 4, edu: 3, salary: [2400000, 3600000, 'INR'],
    description: 'Build features end to end for our analytics product: React front end, Node.js/Express APIs and MongoDB. You will review code, mentor two engineers and work closely with design.' },
  { r: 0, title: 'Machine Learning Engineer, NLP', workMode: 'remote', location: 'India (Remote)', required: ['Python', 'Natural Language Processing', 'PyTorch'], preferred: ['FastAPI', 'MLOps', 'Docker'], years: 3, edu: 4, salary: [3000000, 4500000, 'INR'],
    description: 'Train, evaluate and deploy NLP models for document understanding. Own the path from notebook to production service, including monitoring model quality.' },
  { r: 0, title: 'Platform Engineer (Kubernetes)', workMode: 'onsite', location: 'Hyderabad, India', required: ['Kubernetes', 'Terraform', 'AWS'], preferred: ['Go', 'Monitoring'], years: 5, edu: 0, salary: [2800000, 4000000, 'INR'],
    description: 'Run and improve our Kubernetes platform on AWS. Write Terraform, build golden paths for service teams and keep on-call quiet.' },
  { r: 1, title: 'Frontend Engineer', workMode: 'remote', location: 'Remote', required: ['React', 'TypeScript', 'CSS'], preferred: ['Accessibility', 'Figma'], years: 2, edu: 0, salary: [70000, 95000, 'USD'],
    description: 'Build patient-facing web apps with React and TypeScript. Accessibility matters to us: our users include older adults and people using screen readers.' },
  { r: 1, title: 'Backend Engineer (Python)', workMode: 'hybrid', location: 'Remote / London', required: ['Python', 'Django', 'PostgreSQL', 'REST APIs'], preferred: ['Docker', 'Redis'], years: 3, edu: 3, salary: [75000, 105000, 'USD'],
    description: 'Design APIs for clinical scheduling. Django, PostgreSQL and a lot of careful data modelling. HIPAA-aware engineering practices.' },
  { r: 1, title: 'Data Analyst', workMode: 'remote', location: 'Remote', required: ['SQL', 'Data Analysis', 'Excel'], preferred: ['Python', 'Tableau'], years: 1, edu: 3, salary: [55000, 70000, 'USD'],
    description: 'Turn product and operations data into clear dashboards and recommendations for clinic operations teams.' },
];

async function upsertUser(name: string, email: string, role: 'candidate' | 'recruiter' | 'admin', hash: string) {
  const existing = await User.findOne({ email });
  if (existing) return { user: existing, created: false };
  return { user: await User.create({ name, email, role, passwordHash: hash, authProvider: 'local' }), created: true };
}

async function main() {
  if (isProd && process.env.SEED_ALLOW_PRODUCTION !== 'true') throw new Error('Refusing to seed a production database');
  await connectDatabase();
  if (process.argv.includes('--reset')) {
    if (isProd) throw new Error('--reset is disabled in production');
    for (const name of Object.keys(mongoose.connection.collections)) await mongoose.connection.collections[name].deleteMany({});
    logger.info('Collections cleared');
  }

  // Skill taxonomy
  let added = 0;
  for (const s of skills as { name: string; category: string; aliases: string[]; related: string[] }[]) {
    const r = await Skill.updateOne({ name: s.name }, { $setOnInsert: { ...s, status: 'approved', source: 'seed' } }, { upsert: true });
    added += r.upsertedCount;
  }
  logger.info({ added }, 'Skills seeded');

  const hash = await bcrypt.hash(SEED_PASSWORD, 12);
  await upsertUser('Platform Admin', 'admin@hiresmart.dev', 'admin', hash);

  const recruiterIds: mongoose.Types.ObjectId[] = [];
  for (const r of RECRUITERS) {
    const { user, created } = await upsertUser(r.name, r.email, 'recruiter', hash);
    recruiterIds.push(user._id);
    if (created) await RecruiterProfile.create({ user: user._id, company: r.company, title: r.title, industry: r.industry, companySize: r.companySize, location: r.location });
  }

  const candidateIds: mongoose.Types.ObjectId[] = [];
  for (const c of CANDIDATES) {
    const { user, created } = await upsertUser(c.name, c.email, 'candidate', hash);
    candidateIds.push(user._id);
    if (created) {
      await CandidateProfile.create({
        user: user._id,
        headline: c.headline,
        summary: c.summary,
        location: c.location,
        skills: c.skills.map((name) => ({ name, level: 'advanced' })),
        experience: c.experience,
        education: c.education,
        totalExperienceYears: c.years,
        highestEducationLevel: Math.max(...c.education.map((e) => e.level)),
        openToRecruiters: c.openToRecruiters,
        completeness: 80,
      });
    }
  }

  const jobIds: mongoose.Types.ObjectId[] = [];
  for (const j of JOBS) {
    const company = RECRUITERS[j.r].company;
    let job = await Job.findOne({ title: j.title, company });
    if (!job) {
      job = await Job.create({
        recruiter: recruiterIds[j.r], company, title: j.title, description: j.description, requiredSkills: j.required, preferredSkills: j.preferred,
        minExperienceYears: j.years, educationLevel: j.edu, workMode: j.workMode, location: j.location, employmentType: 'full-time',
        salary: { min: j.salary[0], max: j.salary[1], currency: j.salary[2], period: 'year' }, status: 'published', publishedAt: new Date(Date.now() - Math.random() * 12 * 86400000),
      });
    }
    jobIds.push(job._id);
  }
  if (!(await Job.exists({ title: 'Engineering Manager (draft)' }))) {
    await Job.create({ recruiter: recruiterIds[0], company: RECRUITERS[0].company, title: 'Engineering Manager (draft)', description: 'Draft role: lead a team of six engineers building our analytics platform.', requiredSkills: ['Leadership', 'System Design'], status: 'draft' });
  }

  const pairs: [number, number, 'applied' | 'screened' | 'shortlisted'][] = [[0, 0, 'screened'], [2, 0, 'applied'], [1, 1, 'shortlisted'], [3, 2, 'applied'], [2, 3, 'applied'], [0, 3, 'applied'], [1, 4, 'applied']];
  for (const [ci, ji, status] of pairs) {
    if (await Application.exists({ candidate: candidateIds[ci], job: jobIds[ji] })) continue;
    const job = await Job.findById(jobIds[ji]);
    const history: any[] = [{ from: null, to: 'applied', actor: 'candidate', by: candidateIds[ci], at: new Date(Date.now() - 5 * 86400000) }];
    if (status !== 'applied') history.push({ from: 'applied', to: status, actor: 'recruiter', by: job!.recruiter, at: new Date(Date.now() - 2 * 86400000) });
    const app = await Application.create({ candidate: candidateIds[ci], job: jobIds[ji], recruiter: job!.recruiter, status, statusHistory: history });
    await Job.updateOne({ _id: job!._id }, { $inc: { applicationsCount: 1 } });
    try {
      const m = await matchCandidateToJob(candidateIds[ci], jobIds[ji]);
      await Application.updateOne({ _id: app._id }, { matchResult: m._id, matchScore: m.overallScore, matchCategory: m.category });
    } catch {
      logger.warn('AI service not reachable; seeded application has no match score yet (run screening later)');
    }
    await Notification.create({ user: job!.recruiter, type: 'application', title: 'New application', message: `New application for ${job!.title}`, link: '/recruiter/screening' });
  }

  await AuditLog.create({ action: 'system.seeded', category: 'system', metadata: { env: env.NODE_ENV } });
  logger.info('Seed complete');
  // eslint-disable-next-line no-console
  console.log(`\nSeed complete. All demo accounts use password: ${SEED_PASSWORD}\n  admin@hiresmart.dev\n  ${RECRUITERS.map((r) => r.email).join('\n  ')}\n  ${CANDIDATES.map((c) => c.email).join('\n  ')}\n`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  logger.error({ err }, 'Seed failed');
  // eslint-disable-next-line no-console
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
