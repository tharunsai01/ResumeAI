import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { isProd } from '../config/env';
import {
  User, CandidateProfile, RecruiterProfile, Resume, Job,
  Application, MatchResult, Shortlist, Interview, Notification, Complaint,
} from '../models';

async function seed() {
  if (isProd) throw new Error('Refusing to seed a production database');

  await connectDB();

  await Promise.all([
    User.deleteMany({}), CandidateProfile.deleteMany({}), RecruiterProfile.deleteMany({}),
    Resume.deleteMany({}), Job.deleteMany({}), Application.deleteMany({}),
    MatchResult.deleteMany({}), Shortlist.deleteMany({}), Interview.deleteMany({}),
    Notification.deleteMany({}), Complaint.deleteMany({}),
  ]);
  await mongoose.syncIndexes();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [recruiter, alice, bob] = await User.create([
    { fullName: 'Rita Recruiter', email: 'recruiter@test.com', passwordHash, role: 'recruiter', isVerified: true },
    { fullName: 'Alice Candidate', email: 'alice@test.com', passwordHash, role: 'candidate', isVerified: true },
    { fullName: 'Bob Candidate', email: 'bob@test.com', passwordHash, role: 'candidate', isVerified: true },
  ]);

  await RecruiterProfile.create({
    user: recruiter._id,
    jobTitle: 'Talent Lead',
    companyName: 'Acme Tech',
    industry: 'Software',
    companySize: '51-200',
  });

  await CandidateProfile.create([
    {
      user: alice._id,
      headline: 'Full-stack developer',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      experience: [{ company: 'StartupX', title: 'Developer', current: true }],
      education: [{ institution: 'State University', degree: 'BSc', fieldOfStudy: 'Computer Science', endYear: 2023 }],
    },
    {
      user: bob._id,
      headline: 'Junior frontend developer',
      skills: ['HTML', 'CSS', 'JavaScript'],
    },
  ]);

  const [aliceResume, bobResume] = await Resume.create([
    { candidate: alice._id, fileUrl: 'https://example.com/alice.pdf', fileName: 'alice.pdf', parseStatus: 'done' },
    { candidate: bob._id, fileUrl: 'https://example.com/bob.pdf', fileName: 'bob.pdf', parseStatus: 'done' },
  ]);

  const [job1, job2] = await Job.create([
    {
      recruiter: recruiter._id,
      title: 'Full-stack Developer',
      companyName: 'Acme Tech',
      description: 'Build and maintain our web platform.',
      location: 'Remote',
      workMode: 'remote',
      requiredSkills: ['React', 'Node.js', 'MongoDB'],
      minExperienceYears: 1,
      status: 'open',
    },
    {
      recruiter: recruiter._id,
      title: 'Frontend Intern',
      companyName: 'Acme Tech',
      description: 'Help build UI components.',
      jobType: 'internship',
      requiredSkills: ['HTML', 'CSS', 'JavaScript'],
      status: 'open',
    },
  ]);

  const [appA, appB] = await Application.create([
    { job: job1._id, candidate: alice._id, resume: aliceResume._id, statusHistory: [{ status: 'applied' }] },
    { job: job2._id, candidate: bob._id, resume: bobResume._id, statusHistory: [{ status: 'applied' }] },
  ]);

  await MatchResult.create([
    {
      application: appA._id, job: job1._id, candidate: alice._id,
      skillsScore: 100, experienceScore: 80, educationScore: 90, overallScore: 92,
      matchedSkills: ['React', 'Node.js', 'MongoDB'], missingSkills: [],
      explanation: 'Matches all required skills.', meetsThreshold: true,
    },
    {
      application: appB._id, job: job2._id, candidate: bob._id,
      skillsScore: 100, experienceScore: 60, educationScore: 70, overallScore: 83,
      matchedSkills: ['HTML', 'CSS', 'JavaScript'], missingSkills: [],
      explanation: 'Matches required skills; limited experience.', meetsThreshold: true,
    },
  ]);

  await Shortlist.create({ job: job1._id, candidate: alice._id, application: appA._id, recruiter: recruiter._id });

  await Interview.create({
    application: appA._id, job: job1._id, candidate: alice._id, recruiter: recruiter._id,
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });

  await Notification.create({
    user: alice._id, type: 'shortlisted', message: 'You were shortlisted for Full-stack Developer.',
  });

  await Complaint.create({
    user: bob._id, category: 'technical', description: 'Resume upload seems slow.',
  });

  console.log('Seed complete. Test login: recruiter@test.com / alice@test.com / bob@test.com, password Password123!');
  await disconnectDB();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
