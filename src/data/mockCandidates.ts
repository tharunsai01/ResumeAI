import { mockResumeAnalysis } from "./mockResume"

export interface Candidate {
  id: string;
  summary: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
}

export const mockCandidates: Candidate[] = [
  {
    id: "c_currentUser",
    summary: "Experienced professional with a strong background in software development.",
    personalInfo: {
      name: mockResumeAnalysis.personalInfo.name,
      email: mockResumeAnalysis.personalInfo.email,
      phone: "+1 (555) 9999",
      location: mockResumeAnalysis.personalInfo.location,
      linkedin: "linkedin.com/in/currentuser"
    },
    skills: {
      languages: ["JavaScript", "TypeScript", "Python"],
      frameworks: ["React", "Node.js"],
      tools: ["Git", "Docker"]
    },
    experience: [
      {
        role: "Software Engineer",
        company: "Tech Corp",
        duration: "2021 - Present",
        highlights: ["Developed key features", "Improved performance by 20%"]
      }
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        institution: "University",
        year: "2020"
      }
    ]
  },
  {
    id: "c_1",
    personalInfo: {
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "+1 (555) 0123",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/sarahchen"
    },
    summary: "Senior Full Stack Engineer with 6 years of experience building scalable web applications. Strong focus on React, Node.js, and cloud architecture.",
    skills: {
      languages: ["JavaScript", "TypeScript", "Python", "Go"],
      frameworks: ["React", "Node.js", "Express", "Next.js"],
      tools: ["Docker", "AWS", "Git", "Kubernetes"]
    },
    experience: [
      {
        role: "Senior Software Engineer",
        company: "TechFlow Inc.",
        duration: "2020 - Present",
        highlights: [
          "Led migration of monolith to microservices architecture, reducing deployment time by 40%.",
          "Mentored a team of 4 junior developers.",
          "Implemented CI/CD pipelines using GitHub Actions."
        ]
      }
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        institution: "UC Berkeley",
        year: "2018"
      }
    ]
  },
  {
    id: "c_2",
    personalInfo: {
      name: "James Wilson",
      email: "james.wilson@example.com",
      phone: "+1 (555) 9876",
      location: "Austin, TX",
      linkedin: "linkedin.com/in/jwilson"
    },
    summary: "Data Scientist specializing in machine learning and predictive analytics. Passionate about turning raw data into actionable business insights.",
    skills: {
      languages: ["Python", "R", "SQL"],
      frameworks: ["TensorFlow", "PyTorch", "Scikit-Learn", "Pandas"],
      tools: ["Jupyter", "AWS SageMaker", "Tableau"]
    },
    experience: [
      {
        role: "Data Scientist",
        company: "Analytics Partners",
        duration: "2021 - Present",
        highlights: [
          "Developed predictive model that improved customer retention by 15%.",
          "Built automated data pipelines processing 1TB+ daily.",
          "Presented insights to C-level executives."
        ]
      }
    ],
    education: [
      {
        degree: "M.S. Data Science",
        institution: "UT Austin",
        year: "2021"
      }
    ]
  },
  {
    id: "c_3",
    personalInfo: {
      name: "Emily Rodriguez",
      email: "erodriguez@example.com",
      phone: "+1 (555) 4567",
      location: "New York, NY",
      linkedin: "linkedin.com/in/emilyrod"
    },
    summary: "Product Designer with a focus on intuitive user experiences and inclusive design. Skilled in wireframing, prototyping, and user research.",
    skills: {
      languages: ["HTML", "CSS"],
      frameworks: [],
      tools: ["Figma", "Sketch", "Adobe Creative Suite", "InVision", "Miro"]
    },
    experience: [
      {
        role: "UX/UI Designer",
        company: "Creative Solutions",
        duration: "2019 - Present",
        highlights: [
          "Redesigned core mobile app interface, increasing user engagement by 25%.",
          "Conducted 50+ user interviews for usability testing.",
          "Maintained and expanded the company's design system."
        ]
      }
    ],
    education: [
      {
        degree: "B.F.A. Graphic Design",
        institution: "Rhode Island School of Design",
        year: "2019"
      }
    ]
  },
  {
    id: "c_4",
    personalInfo: {
      name: "Michael Chang",
      email: "mchang@example.com",
      phone: "+1 (555) 2222",
      location: "Seattle, WA",
      linkedin: "linkedin.com/in/michaelchang"
    },
    summary: "DevOps Engineer dedicated to streamlining development workflows and ensuring high system availability. Expert in AWS and Kubernetes.",
    skills: {
      languages: ["Bash", "Python", "Go"],
      frameworks: [],
      tools: ["Kubernetes", "Docker", "Terraform", "AWS", "Jenkins", "Ansible"]
    },
    experience: [
      {
        role: "DevOps Engineer",
        company: "CloudScale Systems",
        duration: "2018 - Present",
        highlights: [
          "Designed and managed multi-region Kubernetes clusters.",
          "Reduced infrastructure costs by 30% through automated resource optimization.",
          "Implemented zero-downtime deployment strategies."
        ]
      }
    ],
    education: [
      {
        degree: "B.S. Information Technology",
        institution: "University of Washington",
        year: "2017"
      }
    ]
  },
  {
    id: "c_5",
    personalInfo: {
      name: "Olivia Patel",
      email: "olivia.patel@example.com",
      phone: "+1 (555) 8888",
      location: "Chicago, IL",
      linkedin: "linkedin.com/in/oliviapatel"
    },
    summary: "Frontend Developer with a keen eye for design and a passion for crafting performant, accessible web applications.",
    skills: {
      languages: ["JavaScript", "TypeScript", "HTML5", "CSS3"],
      frameworks: ["React", "Vue.js", "Tailwind CSS"],
      tools: ["Webpack", "Vite", "Git", "Figma"]
    },
    experience: [
      {
        role: "Frontend Developer",
        company: "WebInnovate",
        duration: "2022 - Present",
        highlights: [
          "Developed responsive landing pages leading to a 10% increase in conversion rates.",
          "Optimized web core vitals, achieving a Lighthouse score of 95+ across all pages.",
          "Collaborated closely with designers to ensure pixel-perfect implementation."
        ]
      }
    ],
    education: [
      {
        degree: "B.S. Computer Science",
        institution: "University of Illinois at Urbana-Champaign",
        year: "2022"
      }
    ]
  }
]
