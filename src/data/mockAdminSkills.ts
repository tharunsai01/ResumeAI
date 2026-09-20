export type SkillStatus = "Active" | "Inactive"
export type CategoryStatus = "Active" | "Inactive"

export interface SkillCategory {
  id: string
  name: string
  description: string
  status: CategoryStatus
}

export interface SkillTaxonomy {
  id: string
  name: string
  categoryId: string
  aliases: string[]
  description: string
  usageCount: number
  status: SkillStatus
  createdAt: string
  updatedAt: string
}

export interface TaxonomyActivity {
  id: string
  action: string
  skill: string
  actor: string
  time: string
}

export const initialSkillCategories: SkillCategory[] = [
  { id: "cat-001", name: "Programming", description: "Core programming languages", status: "Active" },
  { id: "cat-002", name: "Frontend", description: "Client-side development technologies", status: "Active" },
  { id: "cat-003", name: "Backend", description: "Server-side development technologies", status: "Active" },
  { id: "cat-004", name: "Database", description: "Data storage and management systems", status: "Active" },
  { id: "cat-005", name: "Cloud", description: "Cloud computing platforms and services", status: "Active" },
  { id: "cat-006", name: "DevOps", description: "Development and operations tools", status: "Active" },
  { id: "cat-007", name: "Cybersecurity", description: "Security and compliance technologies", status: "Active" },
  { id: "cat-008", name: "Data & AI", description: "Data science and artificial intelligence", status: "Active" },
  { id: "cat-009", name: "Testing", description: "Quality assurance and testing frameworks", status: "Active" },
  { id: "cat-010", name: "Mobile", description: "Mobile application development", status: "Active" },
  { id: "cat-011", name: "Tools", description: "General development tools", status: "Active" },
  { id: "cat-012", name: "Design", description: "UI/UX and product design", status: "Active" }
]

export const initialSkillTaxonomy: SkillTaxonomy[] = [
  // Programming
  { id: "sk-001", name: "Python", categoryId: "cat-001", aliases: ["Python 3", "Python Language"], description: "General-purpose programming language commonly used in software development, automation, data analysis, and AI applications.", usageCount: 182, status: "Active", createdAt: "01 Jan 2026", updatedAt: "18 Sep 2026" },
  { id: "sk-002", name: "Java", categoryId: "cat-001", aliases: ["Java 11", "Java 17", "Core Java"], description: "Object-oriented programming language commonly used for enterprise backend systems.", usageCount: 154, status: "Active", createdAt: "01 Jan 2026", updatedAt: "15 Sep 2026" },
  { id: "sk-003", name: "JavaScript", categoryId: "cat-001", aliases: ["JS", "ECMAScript"], description: "Lightweight, interpreted programming language primarily used for web pages.", usageCount: 210, status: "Active", createdAt: "01 Jan 2026", updatedAt: "20 Sep 2026" },
  { id: "sk-004", name: "C++", categoryId: "cat-001", aliases: ["CPP", "C Plus Plus"], description: "General-purpose programming language used for systems programming and embedded systems.", usageCount: 88, status: "Active", createdAt: "01 Jan 2026", updatedAt: "10 Sep 2026" },
  { id: "sk-005", name: "C#", categoryId: "cat-001", aliases: ["CSharp", "C Sharp"], description: "Modern, object-oriented, and type-safe programming language developed by Microsoft.", usageCount: 95, status: "Active", createdAt: "01 Jan 2026", updatedAt: "12 Sep 2026" },
  
  // Frontend
  { id: "sk-006", name: "React", categoryId: "cat-002", aliases: ["React.js", "ReactJS"], description: "A JavaScript library for building user interfaces.", usageCount: 146, status: "Active", createdAt: "01 Jan 2026", updatedAt: "16 Sep 2026" },
  { id: "sk-007", name: "Angular", categoryId: "cat-002", aliases: ["AngularJS", "Angular 2+"], description: "A platform and framework for building single-page client applications using HTML and TypeScript.", usageCount: 78, status: "Active", createdAt: "01 Jan 2026", updatedAt: "14 Sep 2026" },
  { id: "sk-008", name: "Vue.js", categoryId: "cat-002", aliases: ["Vue", "VueJS"], description: "An approachable, performant and versatile framework for building web user interfaces.", usageCount: 65, status: "Active", createdAt: "01 Jan 2026", updatedAt: "13 Sep 2026" },
  { id: "sk-009", name: "HTML", categoryId: "cat-002", aliases: ["HTML5"], description: "The standard markup language for documents designed to be displayed in a web browser.", usageCount: 220, status: "Active", createdAt: "01 Jan 2026", updatedAt: "05 Sep 2026" },
  { id: "sk-010", name: "CSS", categoryId: "cat-002", aliases: ["CSS3"], description: "Style sheet language used for describing the presentation of a document written in HTML.", usageCount: 215, status: "Active", createdAt: "01 Jan 2026", updatedAt: "05 Sep 2026" },
  { id: "sk-011", name: "Tailwind CSS", categoryId: "cat-002", aliases: ["Tailwind", "TailwindCSS"], description: "A utility-first CSS framework for rapidly building custom user interfaces.", usageCount: 112, status: "Active", createdAt: "01 Jan 2026", updatedAt: "18 Sep 2026" },

  // Backend
  { id: "sk-012", name: "Node.js", categoryId: "cat-003", aliases: ["Node", "NodeJS"], description: "A JavaScript runtime built on Chrome's V8 JavaScript engine.", usageCount: 135, status: "Active", createdAt: "01 Jan 2026", updatedAt: "17 Sep 2026" },
  { id: "sk-013", name: "Express.js", categoryId: "cat-003", aliases: ["Express"], description: "Fast, unopinionated, minimalist web framework for Node.js.", usageCount: 110, status: "Active", createdAt: "01 Jan 2026", updatedAt: "17 Sep 2026" },
  { id: "sk-014", name: "Django", categoryId: "cat-003", aliases: ["Django Framework"], description: "A high-level Python web framework that encourages rapid development and clean, pragmatic design.", usageCount: 85, status: "Active", createdAt: "01 Jan 2026", updatedAt: "15 Sep 2026" },
  { id: "sk-015", name: "Flask", categoryId: "cat-003", aliases: [], description: "A lightweight WSGI web application framework in Python.", usageCount: 60, status: "Active", createdAt: "01 Jan 2026", updatedAt: "12 Sep 2026" },
  { id: "sk-016", name: "Spring Boot", categoryId: "cat-003", aliases: ["Spring", "SpringBoot"], description: "An open-source Java-based framework used to create microservices.", usageCount: 120, status: "Active", createdAt: "01 Jan 2026", updatedAt: "19 Sep 2026" },

  // Database
  { id: "sk-017", name: "MongoDB", categoryId: "cat-004", aliases: ["Mongo"], description: "A source-available cross-platform document-oriented database program.", usageCount: 94, status: "Active", createdAt: "01 Jan 2026", updatedAt: "12 Sep 2026" },
  { id: "sk-018", name: "MySQL", categoryId: "cat-004", aliases: [], description: "An open-source relational database management system.", usageCount: 165, status: "Active", createdAt: "01 Jan 2026", updatedAt: "10 Sep 2026" },
  { id: "sk-019", name: "PostgreSQL", categoryId: "cat-004", aliases: ["Postgres"], description: "A free and open-source relational database management system.", usageCount: 142, status: "Active", createdAt: "01 Jan 2026", updatedAt: "14 Sep 2026" },
  { id: "sk-020", name: "Redis", categoryId: "cat-004", aliases: [], description: "An in-memory data structure store, used as a distributed, in-memory key-value database, cache and message broker.", usageCount: 88, status: "Active", createdAt: "01 Jan 2026", updatedAt: "11 Sep 2026" },

  // Cloud & DevOps
  { id: "sk-021", name: "AWS", categoryId: "cat-005", aliases: ["Amazon Web Services"], description: "Comprehensive and widely adopted cloud platform.", usageCount: 175, status: "Active", createdAt: "01 Jan 2026", updatedAt: "19 Sep 2026" },
  { id: "sk-022", name: "Docker", categoryId: "cat-006", aliases: [], description: "A set of platform as a service products that use OS-level virtualization to deliver software in packages called containers.", usageCount: 150, status: "Active", createdAt: "01 Jan 2026", updatedAt: "16 Sep 2026" },
  { id: "sk-023", name: "Kubernetes", categoryId: "cat-006", aliases: ["K8s"], description: "An open-source container-orchestration system for automating computer application deployment, scaling, and management.", usageCount: 110, status: "Active", createdAt: "01 Jan 2026", updatedAt: "18 Sep 2026" },

  // Data & AI
  { id: "sk-024", name: "Machine Learning", categoryId: "cat-008", aliases: ["ML"], description: "The study of computer algorithms that can improve automatically through experience and by the use of data.", usageCount: 130, status: "Active", createdAt: "01 Jan 2026", updatedAt: "20 Sep 2026" },
  { id: "sk-025", name: "Data Analysis", categoryId: "cat-008", aliases: ["Data Analytics"], description: "A process of inspecting, cleansing, transforming, and modeling data.", usageCount: 145, status: "Active", createdAt: "01 Jan 2026", updatedAt: "19 Sep 2026" },
  { id: "sk-026", name: "Natural Language Processing", categoryId: "cat-008", aliases: ["NLP"], description: "A subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language.", usageCount: 85, status: "Active", createdAt: "01 Jan 2026", updatedAt: "18 Sep 2026" },
  
  // Cyber & Testing
  { id: "sk-027", name: "Network Security", categoryId: "cat-007", aliases: ["NetSec"], description: "Policies, processes and practices adopted to prevent, detect and monitor unauthorized access.", usageCount: 65, status: "Active", createdAt: "01 Jan 2026", updatedAt: "10 Sep 2026" },
  { id: "sk-028", name: "Jest", categoryId: "cat-009", aliases: [], description: "A delightful JavaScript Testing Framework with a focus on simplicity.", usageCount: 105, status: "Active", createdAt: "01 Jan 2026", updatedAt: "14 Sep 2026" },
  
  // Mobile
  { id: "sk-029", name: "React Native", categoryId: "cat-010", aliases: ["RN"], description: "An open-source UI software framework created by Meta Platforms.", usageCount: 75, status: "Active", createdAt: "01 Jan 2026", updatedAt: "12 Sep 2026" },
  
  // Inactive Examples
  { id: "sk-030", name: "jQuery", categoryId: "cat-002", aliases: [], description: "A fast, small, and feature-rich JavaScript library.", usageCount: 45, status: "Inactive", createdAt: "01 Jan 2026", updatedAt: "01 Sep 2026" },
  { id: "sk-031", name: "Subversion", categoryId: "cat-006", aliases: ["SVN"], description: "A software versioning and revision control system.", usageCount: 12, status: "Inactive", createdAt: "01 Jan 2026", updatedAt: "15 Aug 2026" },
  { id: "sk-032", name: "Flash", categoryId: "cat-012", aliases: ["Adobe Flash"], description: "A deprecated multimedia software platform.", usageCount: 2, status: "Inactive", createdAt: "01 Jan 2026", updatedAt: "10 Aug 2026" }
]

export const initialTaxonomyActivity: TaxonomyActivity[] = [
  { id: "act-001", action: "Python updated", skill: "Python", actor: "Admin User", time: "2 hours ago" },
  { id: "act-002", action: "Added Kubernetes", skill: "Kubernetes", actor: "Admin User", time: "Yesterday" },
  { id: "act-003", action: "React alias updated", skill: "React", actor: "Admin User", time: "2 days ago" },
  { id: "act-004", action: "Docker deactivated", skill: "Docker", actor: "Admin User", time: "4 days ago" }
]
