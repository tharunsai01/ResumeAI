export type SkillCategory = "Programming" | "Frontend" | "Backend" | "Database" | "Cloud & DevOps" | "Tools"
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert"
export type SkillPriority = "High" | "Medium" | "Low"

export interface SkillData {
  id: string
  name: string
  category: SkillCategory
  currentScore: number
  targetScore: number
  level: SkillLevel
  priority: SkillPriority
  jobDemand: number // percentage of jobs asking for it
  description: string
  recommendation: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedEffort: string // e.g., "4-6 weeks"
  isDetected: boolean // Whether it came from the resume
}

export interface CareerPath {
  title: string
  readinessScore: number
  strongSkills: string[]
  missingSkills: string[]
}

export interface SkillTrend {
  month: string
  score: number
}

export interface SkillRoleComparison {
  role: string
  userCoverage: number
  targetCoverage: number
  missingSkills: string[]
}

export const mockSkills: SkillData[] = [
  // Detected Skills (From Resume)
  {
    id: "s_java",
    name: "Java",
    category: "Programming",
    currentScore: 90,
    targetScore: 90,
    level: "Advanced",
    priority: "Low",
    jobDemand: 68,
    description: "Strong practical experience and frequent appearance across your projects and experience.",
    recommendation: "Continue using Java in complex distributed systems to reach Expert level.",
    difficulty: "Advanced",
    estimatedEffort: "Ongoing",
    isDetected: true
  },
  {
    id: "s_python",
    name: "Python",
    category: "Programming",
    currentScore: 85,
    targetScore: 90,
    level: "Advanced",
    priority: "Low",
    jobDemand: 61,
    description: "Solid foundation in Python, especially used in backend APIs and scripting.",
    recommendation: "Explore async Python frameworks like FastAPI or data processing libraries.",
    difficulty: "Intermediate",
    estimatedEffort: "2-4 weeks",
    isDetected: true
  },
  {
    id: "s_react",
    name: "React",
    category: "Frontend",
    currentScore: 82,
    targetScore: 90,
    level: "Intermediate",
    priority: "Medium",
    jobDemand: 72,
    description: "Good understanding of React components and state management.",
    recommendation: "Focus on advanced React patterns, performance optimization, and Next.js.",
    difficulty: "Intermediate",
    estimatedEffort: "3-5 weeks",
    isDetected: true
  },
  {
    id: "s_nodejs",
    name: "Node.js",
    category: "Backend",
    currentScore: 80,
    targetScore: 85,
    level: "Intermediate",
    priority: "Medium",
    jobDemand: 65,
    description: "Capable of building scalable REST APIs using Node.js and Express.",
    recommendation: "Learn about Node.js performance profiling and microservices architecture.",
    difficulty: "Intermediate",
    estimatedEffort: "4-6 weeks",
    isDetected: true
  },
  {
    id: "s_mongodb",
    name: "MongoDB",
    category: "Database",
    currentScore: 76,
    targetScore: 85,
    level: "Intermediate",
    priority: "Medium",
    jobDemand: 55,
    description: "Experience with NoSQL schema design and basic aggregation pipelines.",
    recommendation: "Deep dive into advanced aggregation, indexing, and replication.",
    difficulty: "Intermediate",
    estimatedEffort: "3-4 weeks",
    isDetected: true
  },
  {
    id: "s_sql",
    name: "SQL",
    category: "Database",
    currentScore: 72,
    targetScore: 85,
    level: "Intermediate",
    priority: "Medium",
    jobDemand: 80,
    description: "Basic querying and table design skills.",
    recommendation: "Practice complex joins, window functions, and query optimization.",
    difficulty: "Intermediate",
    estimatedEffort: "2-3 weeks",
    isDetected: true
  },
  {
    id: "s_aws",
    name: "AWS",
    category: "Cloud & DevOps",
    currentScore: 65,
    targetScore: 80,
    level: "Intermediate",
    priority: "Medium",
    jobDemand: 54,
    description: "Improves your cloud readiness.",
    recommendation: "Focus on core services (EC2, S3, RDS) and Serverless (Lambda, API Gateway).",
    difficulty: "Intermediate",
    estimatedEffort: "4-6 weeks",
    isDetected: true
  },
  {
    id: "s_docker",
    name: "Docker",
    category: "Cloud & DevOps",
    currentScore: 60,
    targetScore: 80,
    level: "Intermediate",
    priority: "High",
    jobDemand: 48,
    description: "Basic containerization of applications.",
    recommendation: "Learn multi-stage builds, docker-compose for dev environments, and networking.",
    difficulty: "Intermediate",
    estimatedEffort: "2-3 weeks",
    isDetected: true
  },

  // Recommended/Gap Skills (Not in Resume or low score)
  {
    id: "s_k8s",
    name: "Kubernetes",
    category: "Cloud & DevOps",
    currentScore: 40,
    targetScore: 70,
    level: "Beginner",
    priority: "High",
    jobDemand: 36,
    description: "Frequently requested in DevOps and cloud engineering positions.",
    recommendation: "1. Learn Kubernetes fundamentals\n2. Deploy a containerized application\n3. Practice Kubernetes networking\n4. Build a small production-style deployment",
    difficulty: "Intermediate",
    estimatedEffort: "4-6 weeks",
    isDetected: false
  },
  {
    id: "s_sysdesign",
    name: "System Design",
    category: "Backend",
    currentScore: 45,
    targetScore: 70,
    level: "Beginner",
    priority: "High",
    jobDemand: 45,
    description: "Can strengthen your profile for mid-level software engineering roles.",
    recommendation: "Study large-scale architectures, caching strategies, load balancing, and database sharding.",
    difficulty: "Advanced",
    estimatedEffort: "4-8 weeks",
    isDetected: false
  },
  {
    id: "s_springboot",
    name: "Spring Boot",
    category: "Backend",
    currentScore: 55,
    targetScore: 75,
    level: "Beginner",
    priority: "Medium",
    jobDemand: 40,
    description: "Commonly used alongside Java for enterprise backend roles.",
    recommendation: "Learn Spring Security, Data JPA, and building microservices with Spring Cloud.",
    difficulty: "Intermediate",
    estimatedEffort: "3-5 weeks",
    isDetected: false
  },
  {
    id: "s_typescript",
    name: "TypeScript",
    category: "Frontend",
    currentScore: 70,
    targetScore: 90,
    level: "Intermediate",
    priority: "Medium",
    jobDemand: 60,
    description: "Becoming the standard for scalable frontend development.",
    recommendation: "Master advanced types, generics, and configuration options.",
    difficulty: "Intermediate",
    estimatedEffort: "2-3 weeks",
    isDetected: true // In mockResume it was 70
  }
]

export const mockCareerPaths: CareerPath[] = [
  {
    title: "Software Engineer",
    readinessScore: 94,
    strongSkills: ["Java", "Python", "REST API"],
    missingSkills: ["System Design", "Advanced SQL"]
  },
  {
    title: "Full Stack Developer",
    readinessScore: 89,
    strongSkills: ["React", "Node.js", "MongoDB"],
    missingSkills: ["TypeScript Mastery", "CI/CD"]
  },
  {
    title: "Backend Developer",
    readinessScore: 87,
    strongSkills: ["Java", "Node.js", "MongoDB"],
    missingSkills: ["Redis", "Message Queues", "System Design"]
  },
  {
    title: "DevOps Engineer",
    readinessScore: 68,
    strongSkills: ["Linux", "Docker", "AWS"],
    missingSkills: ["Kubernetes", "CI/CD", "Terraform"]
  },
  {
    title: "Cloud Engineer",
    readinessScore: 62,
    strongSkills: ["AWS", "Docker"],
    missingSkills: ["Kubernetes", "Cloud Networking", "Serverless"]
  }
]

export const mockSkillTrend: SkillTrend[] = [
  { month: "Apr", score: 72 },
  { month: "May", score: 75 },
  { month: "Jun", score: 77 },
  { month: "Jul", score: 79 },
  { month: "Aug", score: 82 },
  { month: "Sep", score: 85 }
]

export const mockRoleComparisons: SkillRoleComparison[] = [
  { role: "Software Engineer", userCoverage: 85, targetCoverage: 90, missingSkills: ["System Design", "Microservices"] },
  { role: "Frontend Engineer", userCoverage: 78, targetCoverage: 90, missingSkills: ["Advanced TypeScript", "Web Performance", "State Management"] },
  { role: "Backend Engineer", userCoverage: 86, targetCoverage: 90, missingSkills: ["Redis", "Message Queues", "Advanced SQL"] },
  { role: "DevOps Engineer", userCoverage: 45, targetCoverage: 85, missingSkills: ["Kubernetes", "Terraform", "CI/CD Pipelines"] },
  { role: "Full Stack Developer", userCoverage: 82, targetCoverage: 88, missingSkills: ["CI/CD", "System Design"] }
]

export const mockCategoryScores = [
  { category: "Programming", score: 92, description: "Excellent programming foundation." },
  { category: "Frontend", score: 84, description: "Strong frontend frameworks understanding." },
  { category: "Backend", score: 86, description: "Solid API and server development skills." },
  { category: "Database", score: 78, description: "Good NoSQL knowledge, needs SQL depth." },
  { category: "Cloud & DevOps", score: 65, description: "Basic understanding, high priority gap." },
  { category: "Tools", score: 82, description: "Proficient with standard developer tools." }
]
