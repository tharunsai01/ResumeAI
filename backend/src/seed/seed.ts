import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { isProd } from '../config/env';
import {
  User,
  CandidateProfile,
  RecruiterProfile,
  Resume,
  Job,
  Application,
  MatchResult,
  Shortlist,
  Interview,
  Notification,
  Complaint,
  Skill,
  ScreeningSettings,
  AuditLog,
  AIEvaluation,
} from '../models';

async function seed() {
  if (isProd) throw new Error('Refusing to seed a production database');

  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    CandidateProfile.deleteMany({}),
    RecruiterProfile.deleteMany({}),
    Resume.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    MatchResult.deleteMany({}),
    Shortlist.deleteMany({}),
    Interview.deleteMany({}),
    Notification.deleteMany({}),
    Complaint.deleteMany({}),
    Skill.deleteMany({}),
    ScreeningSettings.deleteMany({}),
    AuditLog.deleteMany({}),
    AIEvaluation.deleteMany({}),
  ]);
  await mongoose.syncIndexes();

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const [admin, recruiter, alice, bob] = await User.create([
    {
      fullName: 'System Administrator',
      email: 'admin@hiresmart.ai',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
      status: 'active',
    },
    {
      fullName: 'Rita Recruiter',
      email: 'recruiter@test.com',
      passwordHash,
      role: 'recruiter',
      isVerified: true,
      status: 'active',
    },
    {
      fullName: 'Alice Candidate',
      email: 'alice@test.com',
      passwordHash,
      role: 'candidate',
      isVerified: true,
      status: 'active',
    },
    {
      fullName: 'Bob Candidate',
      email: 'bob@test.com',
      passwordHash,
      role: 'candidate',
      isVerified: true,
      status: 'active',
    },
  ]);

  await RecruiterProfile.create({
    user: recruiter._id,
    fullName: 'Rita Recruiter',
    jobTitle: 'Talent Acquisition Lead',
    designation: 'Lead Technical Recruiter',
    companyName: 'HireSmart Technologies',
    companyOverview: 'Pioneering responsible AI-powered recruitment and job matching solutions.',
    industry: 'Software & Technology',
    companySize: '51-200',
    website: 'https://hiresmart.ai',
    description: 'We build intelligent, human-centered recruitment tools.',
    location: 'Bangalore, India',
  });

  const [aliceResume, bobResume] = await Resume.create([
    {
      candidate: alice._id,
      fileUrl: '/api/v1/resumes/download-alice',
      fileName: 'Alice_Resume_2026.pdf',
      originalFilename: 'Alice_Resume_2026.pdf',
      storedFileName: 'seed-alice-resume.pdf',
      mimeType: 'application/pdf',
      fileType: 'application/pdf',
      sizeBytes: 184500,
      fileSize: 184500,
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rawText: 'Alice Candidate. Full-stack developer with 3+ years experience building React, Node.js, TypeScript, and MongoDB applications. BSc in Computer Science from State University.',
      parsedData: {
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS'],
        totalExperienceYears: 3,
        contact: { email: 'alice@test.com', phone: '+91 98765 11111' },
      },
      aiAnalysis: {
        summary: 'Strong full-stack engineer with proven experience in modern web stacks, scalable APIs, and cloud services.',
        qualityScore: 92,
        breakdown: { skills: 95, experience: 88, education: 90, projects: 92 },
        skills: [
          { name: 'React', score: 95, category: 'Frontend' },
          { name: 'Node.js', score: 90, category: 'Backend' },
          { name: 'TypeScript', score: 92, category: 'Programming' },
          { name: 'MongoDB', score: 88, category: 'Database' },
        ],
        strengths: ['Strong modern JavaScript ecosystem proficiency', 'Full development lifecycle experience', 'Cloud and microservices background'],
        weaknesses: ['Could document more quantitative business impacts'],
        suggestions: ['Include metrics on latency reduction or performance gains'],
        missingKeywords: ['CI/CD Pipeline', 'GraphQL', 'Terraform'],
        analyzedAt: new Date(),
        provider: 'openai/gpt-oss-20b',
      },
      parseStatus: 'done',
      analysisStatus: 'completed',
      isActive: true,
    },
    {
      candidate: bob._id,
      fileUrl: '/api/v1/resumes/download-bob',
      fileName: 'Bob_Resume.pdf',
      originalFilename: 'Bob_Resume.pdf',
      storedFileName: 'seed-bob-resume.pdf',
      mimeType: 'application/pdf',
      fileType: 'application/pdf',
      sizeBytes: 124000,
      fileSize: 124000,
      fileHash: 'f4c0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999',
      rawText: 'Bob Candidate. Junior frontend developer with 1 year experience in HTML, CSS, JavaScript, and Tailwind CSS. Eager to grow as a React engineer.',
      parsedData: {
        skills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS'],
        totalExperienceYears: 1,
        contact: { email: 'bob@test.com', phone: '+91 98765 22222' },
      },
      aiAnalysis: {
        summary: 'Emerging frontend developer with solid web fundamentals and passionate eagerness to master React and UI engineering.',
        qualityScore: 78,
        breakdown: { skills: 75, experience: 70, education: 85, projects: 80 },
        skills: [
          { name: 'HTML5', score: 90, category: 'Frontend' },
          { name: 'CSS3', score: 85, category: 'Frontend' },
          { name: 'JavaScript', score: 80, category: 'Programming' },
        ],
        strengths: ['Solid foundation in responsive web design', 'High enthusiasm and fast learner'],
        weaknesses: ['Limited backend and state management experience'],
        suggestions: ['Build full-stack applications with React and REST APIs'],
        missingKeywords: ['TypeScript', 'Testing', 'Node.js'],
        analyzedAt: new Date(),
        provider: 'openai/gpt-oss-20b',
      },
      parseStatus: 'done',
      analysisStatus: 'completed',
      isActive: true,
    },
  ]);

  await CandidateProfile.create([
    {
      user: alice._id,
      headline: 'Full-stack Developer (React • Node.js • TypeScript)',
      summary: 'Passionate software engineer focused on building robust, scalable web applications and accessible user experiences.',
      phone: '+91 98765 11111',
      location: 'Bangalore, India',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS'],
      experience: [
        {
          company: 'TechFlow Systems',
          title: 'Software Engineer',
          startDate: new Date('2023-06-01'),
          current: true,
          description: 'Developed scalable microservices and responsive React web dashboards.',
          location: 'Bangalore',
        },
      ],
      education: [
        {
          institution: 'State University of Technology',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science & Engineering',
          startYear: 2019,
          endYear: 2023,
          grade: '8.8 CGPA',
        },
      ],
      projects: [
        {
          title: 'E-Commerce Microservices Platform',
          description: 'Designed and deployed an order processing pipeline with event-driven architecture.',
          technologies: ['Node.js', 'TypeScript', 'Docker', 'MongoDB'],
          link: 'https://github.com/alice/ecommerce-microservices',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2024-01-15'),
        },
      ],
      resume: aliceResume._id,
      profileCompletion: 95,
    },
    {
      user: bob._id,
      headline: 'Junior Frontend Developer',
      summary: 'Aspiring frontend developer dedicated to clean code, semantic HTML, and responsive CSS styling.',
      phone: '+91 98765 22222',
      location: 'Hyderabad, India',
      skills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS'],
      experience: [
        {
          company: 'PixelCraft Studio',
          title: 'Frontend Intern',
          startDate: new Date('2024-01-01'),
          current: true,
          description: 'Converted Figma designs into pixel-perfect responsive web pages.',
          location: 'Hyderabad',
        },
      ],
      education: [
        {
          institution: 'National Institute of Science',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Information Technology',
          startYear: 2020,
          endYear: 2024,
        },
      ],
      resume: bobResume._id,
      profileCompletion: 80,
    },
  ]);

  const [job1, job2, job3] = await Job.create([
    {
      recruiter: recruiter._id,
      title: 'Full-stack Developer',
      companyName: 'HireSmart Technologies',
      companyOverview: 'Building next-generation intelligent hiring platforms.',
      department: 'Engineering',
      description: 'We are looking for a skilled Full-stack Developer to build and scale our core AI recruitment platform.',
      responsibilities: [
        'Develop and maintain RESTful APIs in Node.js and TypeScript',
        'Create performant, responsive user interfaces in React',
        'Collaborate with AI engineers to integrate ML models',
      ],
      requirements: [
        '2+ years of experience with React and Node.js',
        'Proficiency in TypeScript and MongoDB',
        'Familiarity with containerization (Docker)',
      ],
      location: 'Bangalore, India',
      workMode: 'remote',
      jobType: 'full-time',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      niceToHaveSkills: ['Docker', 'AWS', 'GraphQL'],
      minExperienceYears: 2,
      maxExperienceYears: 5,
      educationLevel: 'bachelors',
      salary: { min: 1000000, max: 1600000, currency: 'INR' },
      openings: 2,
      status: 'open',
      applicationCount: 2,
    },
    {
      recruiter: recruiter._id,
      title: 'Frontend Developer Intern',
      companyName: 'HireSmart Technologies',
      department: 'Design & Frontend',
      description: 'Exciting internship opportunity for enthusiastic developers to create engaging interfaces.',
      responsibilities: ['Assist in implementing design system components', 'Write clean, accessible HTML/CSS'],
      requirements: ['Knowledge of HTML5, CSS3, and modern JavaScript'],
      location: 'Remote',
      workMode: 'remote',
      jobType: 'internship',
      requiredSkills: ['HTML', 'CSS', 'JavaScript'],
      niceToHaveSkills: ['React', 'Tailwind CSS'],
      minExperienceYears: 0,
      educationLevel: 'any',
      status: 'open',
      applicationCount: 1,
    },
    {
      recruiter: recruiter._id,
      title: 'Senior AI Engineer',
      companyName: 'HireSmart Technologies',
      department: 'AI & Data Science',
      description: 'Lead the development of candidate-job matching algorithms and evaluation frameworks.',
      requiredSkills: ['Python', 'NLP', 'PyTorch', 'FastAPI', 'Groq API'],
      minExperienceYears: 4,
      status: 'draft',
      applicationCount: 0,
    },
  ]);

  const [appA, appB] = await Application.create([
    {
      job: job1._id,
      candidate: alice._id,
      resume: aliceResume._id,
      coverLetter: 'I am excited about building responsible recruitment AI at HireSmart.',
      status: 'screened',
      matchScore: 92,
      matchedSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      statusHistory: [{ status: 'applied' }, { status: 'screened', note: 'AI screening passed' }],
    },
    {
      job: job1._id,
      candidate: bob._id,
      resume: bobResume._id,
      status: 'applied',
      matchScore: 68,
      matchedSkills: ['JavaScript'],
      missingSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      statusHistory: [{ status: 'applied' }],
    },
  ]);

  const matchA = await MatchResult.create({
    application: appA._id,
    job: job1._id,
    candidate: alice._id,
    skillsScore: 95,
    experienceScore: 90,
    educationScore: 90,
    overallScore: 92,
    matchedSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    missingSkills: [],
    explanation: 'Candidate matches all primary required technical skills with solid hands-on experience.',
    meetsThreshold: true,
    recommendation: 'strong_match',
    strengths: ['Direct experience with full stack requirements', 'Strong education and certification'],
    gaps: ['Could expand on cloud deployment depth'],
    actionableSuggestions: ['Explore advanced AWS architecture certifications'],
  });
  appA.matchResult = matchA._id;
  await appA.save();

  await Shortlist.create({
    job: job1._id,
    candidate: alice._id,
    application: appA._id,
    recruiter: recruiter._id,
  });

  await Interview.create({
    application: appA._id,
    job: job1._id,
    candidate: alice._id,
    recruiter: recruiter._id,
    title: 'Technical Round 1: Architecture & Problem Solving',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    durationMins: 45,
    mode: 'video',
    meetingLink: 'https://meet.google.com/xyz-hiresmart-test',
    status: 'scheduled',
  });

  await Notification.create([
    {
      user: alice._id,
      type: 'shortlisted',
      title: 'Application Shortlisted',
      message: 'Congratulations! You have been shortlisted for Full-stack Developer at HireSmart Technologies.',
      link: '/candidate/applications',
    },
    {
      user: recruiter._id,
      type: 'screening_completed',
      title: 'AI Screening Completed',
      message: 'AI screening completed for Alice Candidate on "Full-stack Developer". Score: 92%',
      link: '/recruiter/applications',
    },
    {
      user: admin._id,
      type: 'system',
      title: 'Platform Initialized',
      message: 'HireSmart AI main backend system operational and ready.',
      link: '/admin/dashboard',
    },
  ]);

  await Complaint.create([
    {
      user: bob._id,
      title: 'Resume upload took longer than expected',
      category: 'technical',
      description: 'The PDF parsing completed, but it took around 15 seconds to extract text.',
      status: 'open',
    },
    {
      user: alice._id,
      title: 'Skill taxonomy clarification',
      category: 'ai_screening',
      description: 'Requesting addition of Tailwind CSS to frontend categories in screening.',
      status: 'resolved',
      adminResponse: 'Tailwind CSS has been added to the approved skill taxonomy.',
      resolvedBy: admin._id,
      resolvedAt: new Date(),
    },
  ]);

  // Seed Skill Taxonomy
  const standardSkills = [
    { name: 'JavaScript', category: 'Programming', level: 'Intermediate', synonyms: ['JS', 'ES6', 'ECMAScript'] },
    { name: 'TypeScript', category: 'Programming', level: 'Intermediate', synonyms: ['TS'] },
    { name: 'Python', category: 'Programming', level: 'Intermediate', synonyms: ['Py', 'Python3'] },
    { name: 'Java', category: 'Programming', level: 'Intermediate', synonyms: ['Core Java', 'J2EE'] },
    { name: 'React', category: 'Frontend', level: 'Intermediate', synonyms: ['React.js', 'ReactJS'] },
    { name: 'Next.js', category: 'Frontend', level: 'Intermediate', synonyms: ['NextJS', 'Next'] },
    { name: 'Vue.js', category: 'Frontend', level: 'Intermediate', synonyms: ['Vue', 'VueJS'] },
    { name: 'Angular', category: 'Frontend', level: 'Intermediate', synonyms: ['Angular2+'] },
    { name: 'Node.js', category: 'Backend', level: 'Intermediate', synonyms: ['NodeJS', 'Node'] },
    { name: 'Express', category: 'Backend', level: 'Intermediate', synonyms: ['Express.js', 'ExpressJS'] },
    { name: 'NestJS', category: 'Backend', level: 'Intermediate', synonyms: ['Nest.js'] },
    { name: 'FastAPI', category: 'Backend', level: 'Intermediate', synonyms: [] },
    { name: 'Django', category: 'Backend', level: 'Intermediate', synonyms: [] },
    { name: 'MongoDB', category: 'Database', level: 'Intermediate', synonyms: ['Mongo'] },
    { name: 'PostgreSQL', category: 'Database', level: 'Intermediate', synonyms: ['Postgres', 'PG'] },
    { name: 'MySQL', category: 'Database', level: 'Intermediate', synonyms: [] },
    { name: 'Redis', category: 'Database', level: 'Intermediate', synonyms: ['Redis Cache'] },
    { name: 'Docker', category: 'DevOps', level: 'Intermediate', synonyms: ['Containers'] },
    { name: 'Kubernetes', category: 'DevOps', level: 'Intermediate', synonyms: ['K8s'] },
    { name: 'AWS', category: 'Cloud', level: 'Intermediate', synonyms: ['Amazon Web Services'] },
    { name: 'Azure', category: 'Cloud', level: 'Intermediate', synonyms: ['Microsoft Azure'] },
    { name: 'GCP', category: 'Cloud', level: 'Intermediate', synonyms: ['Google Cloud Platform'] },
    { name: 'CI/CD', category: 'DevOps', level: 'Intermediate', synonyms: ['Continuous Integration', 'Jenkins', 'GitHub Actions'] },
    { name: 'Git', category: 'Tools', level: 'Beginner', synonyms: ['GitHub', 'GitLab'] },
    { name: 'HTML5', category: 'Frontend', level: 'Beginner', synonyms: ['HTML'] },
    { name: 'CSS3', category: 'Frontend', level: 'Beginner', synonyms: ['CSS'] },
    { name: 'Tailwind CSS', category: 'Frontend', level: 'Intermediate', synonyms: ['Tailwind'] },
    { name: 'GraphQL', category: 'API', level: 'Intermediate', synonyms: [] },
    { name: 'REST APIs', category: 'API', level: 'Intermediate', synonyms: ['RESTful', 'REST API'] },
    { name: 'Machine Learning', category: 'AI/ML', level: 'Intermediate', synonyms: ['ML'] },
    { name: 'NLP', category: 'AI/ML', level: 'Advanced', synonyms: ['Natural Language Processing'] },
    // Unknown skills pending admin review
    {
      name: 'Mojo Lang',
      category: 'Programming',
      level: 'Beginner',
      status: 'pending_review',
      isUnknown: true,
      source: 'ai_extracted',
      synonyms: ['Mojo'],
    },
    {
      name: 'Bun Runtime',
      category: 'Backend',
      level: 'Intermediate',
      status: 'pending_review',
      isUnknown: true,
      source: 'ai_extracted',
      synonyms: ['Bun.js'],
    },
  ];

  for (const s of standardSkills) {
    await Skill.create({
      name: s.name,
      category: s.category,
      level: s.level as any,
      status: (s.status as any) || 'approved',
      isUnknown: s.isUnknown || false,
      source: (s.source as any) || 'system',
      synonyms: s.synonyms,
      jobDemand: 75,
      trend: 'rising',
    });
  }

  // Seed Screening Settings
  await ScreeningSettings.create({
    isDefault: true,
    threshold: 80,
    weights: {
      skills: 50,
      experience: 20,
      education: 10,
      roleSimilarity: 20,
    },
    autoShortlistThreshold: 85,
    autoRejectThreshold: 45,
  });

  // Seed AI Evaluation
  await AIEvaluation.create({
    evaluatedBy: admin._id,
    modelVersion: 'openai/gpt-oss-20b',
    provider: 'Groq',
    sampleSize: 150,
    fairnessScore: 94,
    stabilityScore: 92,
    extractionAccuracy: 95,
    securityScore: 98,
    overallScore: 94.75,
    testResults: {
      demographicParity: 95.2,
      disparateImpactRatio: 0.97,
      hallucinationRate: 1.8,
      promptInjectionDefense: 99.1,
      piiLeakageDefense: 99.4,
      latencyAvgMs: 280,
    },
    recommendations: [
      'Maintain continuous calibration checks across edge-case resume layouts',
      'Ensure prompt guardrails remain updated against emerging jailbreak variants',
    ],
    status: 'completed',
  });

  // Seed Audit Logs
  await AuditLog.create([
    {
      action: 'SYSTEM_BOOTSTRAP',
      actorEmail: 'admin@hiresmart.ai',
      actorRole: 'admin',
      targetType: 'System',
      targetId: 'bootstrap',
      status: 'success',
      details: { environment: 'development', version: '1.0.0' },
    },
    {
      action: 'AUTH_LOGIN',
      actorEmail: 'recruiter@test.com',
      actorRole: 'recruiter',
      targetType: 'User',
      targetId: recruiter._id.toString(),
      status: 'success',
      ipAddress: '127.0.0.1',
    },
  ]);

  console.log('HireSmart AI Database Seeded Successfully!');
  console.log('--------------------------------------------------');
  console.log('Admin:     admin@hiresmart.ai / admin123');
  console.log('Recruiter: recruiter@test.com / Password123!');
  console.log('Candidate: alice@test.com / Password123!');
  console.log('Candidate: bob@test.com / Password123!');
  console.log('--------------------------------------------------');

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
