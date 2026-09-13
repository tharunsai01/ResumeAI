export interface SkillStrength {
  name: string
  score: number
  category: "Programming" | "Frontend" | "Backend" | "Database" | "Cloud & DevOps"
}

export interface Experience {
  title: string
  company: string
  duration: string
  description: string[]
}

export interface Education {
  degree: string
  institution: string
  duration: string
}

export interface Project {
  name: string
  techStack: string[]
  description: string
}

export interface ResumeAnalysisResult {
  score: number
  breakdown: {
    skills: number
    experience: number
    education: number
    projects: number
  }
  personalInfo: {
    name: string
    email: string
    experience: string
    education: string
    location: string
  }
  skills: SkillStrength[]
  experience: Experience[]
  education: Education[]
  projects: Project[]
  insights: {
    strengths: string[]
    improvements: string[]
    summary: string
  }
}

export const mockResumeAnalysis: ResumeAnalysisResult = {
  score: 85,
  breakdown: {
    skills: 90,
    experience: 85,
    education: 100,
    projects: 78,
  },
  personalInfo: {
    name: "Rahul Kumar",
    email: "rahul@example.com",
    experience: "2 Years",
    education: "B.Tech in Computer Science",
    location: "Bangalore, India",
  },
  skills: [
    { name: "Java", score: 90, category: "Programming" },
    { name: "Python", score: 82, category: "Programming" },
    { name: "C++", score: 70, category: "Programming" },
    { name: "React", score: 75, category: "Frontend" },
    { name: "TypeScript", score: 70, category: "Frontend" },
    { name: "Tailwind CSS", score: 80, category: "Frontend" },
    { name: "Node.js", score: 85, category: "Backend" },
    { name: "Express", score: 80, category: "Backend" },
    { name: "REST API", score: 85, category: "Backend" },
    { name: "MongoDB", score: 74, category: "Database" },
    { name: "SQL", score: 75, category: "Database" },
    { name: "AWS", score: 68, category: "Cloud & DevOps" },
    { name: "Docker", score: 60, category: "Cloud & DevOps" },
    { name: "Linux", score: 75, category: "Cloud & DevOps" },
  ],
  experience: [
    {
      title: "Software Developer",
      company: "ABC Technologies",
      duration: "2024 – Present",
      description: [
        "Developed backend services",
        "Worked with Java and Spring Boot",
        "Designed REST APIs",
        "Worked with MongoDB"
      ]
    },
    {
      title: "Software Intern",
      company: "XYZ Solutions",
      duration: "2023 – 2024",
      description: [
        "Assisted in full-stack feature development.",
        "Collaborated with senior engineers on internal tools.",
        "Wrote unit tests ensuring 80% code coverage."
      ]
    }
  ],
  education: [
    {
      degree: "B.Tech — Computer Science",
      institution: "ABC University",
      duration: "2021 – 2025"
    }
  ],
  projects: [
    {
      name: "AI Resume Screening System",
      techStack: ["Python", "FastAPI", "React", "MongoDB"],
      description: "AI-powered recruitment platform for resume analysis and job matching."
    },
    {
      name: "E-Commerce Microservices",
      techStack: ["Java", "Spring Boot", "Docker", "AWS"],
      description: "Scalable e-commerce backend built with microservices architecture."
    }
  ],
  insights: {
    strengths: [
      "Strong Java and Python experience",
      "Good full-stack development exposure",
      "Relevant project experience",
      "Strong database knowledge"
    ],
    improvements: [
      "Add measurable achievements",
      "Improve cloud experience",
      "Add Kubernetes experience"
    ],
    summary: "Rahul is a strong software engineering candidate with 2 years of experience in Java, Python, React, and MongoDB. His technical profile is well aligned with backend and full-stack development roles. Additional cloud and Kubernetes experience could improve his profile."
  }
}
