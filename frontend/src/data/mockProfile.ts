import type {
  CareerLevel,
  Education,
  Experience,
  Project,
  CareerPreferences,
  CandidateProfile
} from "../types/candidate"
import type { JobType, WorkMode } from "../types/job"

export type {
  CareerLevel,
  JobType,
  WorkMode,
  Education,
  Experience,
  Project,
  CareerPreferences,
  CandidateProfile
}

export const defaultMockProfile: CandidateProfile = {
  id: "cand_1",
  fullName: "Rahul Kumar",
  email: "rahul.kumar@example.com",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  linkedin: "linkedin.com/in/rahulkumar",
  github: "github.com/rahulkumar",
  portfolio: "rahulkumar.dev",
  avatar: "",
  summary: "Software engineering candidate with experience in Java, Python, React, Node.js, MongoDB, and cloud technologies. Interested in building scalable software systems and AI-powered applications.",
  currentRole: "Software Engineer",
  yearsOfExperience: "2",
  careerLevel: "Entry Level",
  skills: [
    { id: "s_java", name: "Java", level: "Advanced", category: "Programming" },
    { id: "s_python", name: "Python", level: "Advanced", category: "Programming" },
    { id: "s_react", name: "React", level: "Intermediate", category: "Frontend" }
  ],
  education: [
    {
      id: "edu_1",
      degree: "Bachelor of Engineering",
      fieldOfStudy: "Computer Science and Engineering",
      institution: "XYZ University",
      startYear: "2019",
      endYear: "2023",
      grade: "8.5 CGPA"
    }
  ],
  experience: [
    {
      id: "exp_1",
      jobTitle: "Software Engineering Intern",
      company: "ABC Technologies",
      location: "Bangalore, India",
      startDate: "Jun 2022",
      endDate: "Aug 2022",
      currentlyWorking: false,
      description: "Worked on REST APIs and frontend development."
    }
  ],
  projects: [
    {
      id: "proj_1",
      name: "AI-Based Resume Screening & Job Matching System",
      description: "AI-powered platform that analyzes resumes and matches candidates with relevant job opportunities.",
      technologies: ["Python", "React", "Node.js", "MongoDB", "Machine Learning"],
      githubUrl: "github.com/rahulkumar/resume-ai",
      startDate: "Jan 2023",
      endDate: "May 2023"
    }
  ],
  careerPreferences: {
    preferredJobTitles: ["Software Engineer", "Full Stack Developer", "Backend Developer", "AI Engineer"],
    preferredLocations: ["Bangalore", "Hyderabad", "Pune", "Remote"],
    preferredJobType: ["Full-time", "Internship"],
    preferredWorkMode: ["Remote", "Hybrid"],
    preferredExperienceLevel: "Entry Level",
    expectedSalary: "₹6–10 LPA",
    willingToRelocate: true
  },
  careerInterests: [
    "Artificial Intelligence",
    "Software Development",
    "Web Development",
    "Cloud Computing"
  ],
  openToWork: true,
  visibility: "Visible to Recruiters",
  profileCompletion: 85
}
