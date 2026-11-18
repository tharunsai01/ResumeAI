// Difficulty, effort and wording for the Skill Analysis page. Plain templates, no LLM.

const CATEGORY_DEFAULTS = {
    Programming: { difficulty: "Intermediate", effort: "4-8 weeks" },
    Frontend: { difficulty: "Intermediate", effort: "3-5 weeks" },
    Backend: { difficulty: "Intermediate", effort: "3-6 weeks" },
    Database: { difficulty: "Intermediate", effort: "2-4 weeks" },
    "Cloud & DevOps": { difficulty: "Intermediate", effort: "3-6 weeks" },
    Tools: { difficulty: "Beginner", effort: "1-2 weeks" },
    "AI & Data": { difficulty: "Advanced", effort: "6-10 weeks" },
  };
  
  // [name, difficulty, effort, what it is used for]
  const OVERRIDES = [
    ["Kubernetes", "Intermediate", "4-6 weeks", "Frequently requested in DevOps and cloud engineering roles."],
    ["Docker", "Beginner", "1-3 weeks", "Used to package and run applications the same way everywhere."],
    ["AWS", "Intermediate", "4-6 weeks", "The most requested cloud platform for backend and DevOps roles."],
    ["CI/CD", "Intermediate", "2-4 weeks", "Automates testing and deployment, expected in most engineering teams."],
    ["Terraform", "Intermediate", "3-5 weeks", "Describes cloud infrastructure as code."],
    ["Jenkins", "Intermediate", "2-4 weeks", "A common automation server for build and deployment pipelines."],
    ["Linux", "Beginner", "2-4 weeks", "The everyday environment for servers and DevOps work."],
    ["Git", "Beginner", "1-2 weeks", "Expected in every engineering role for teamwork and code history."],
    ["TypeScript", "Intermediate", "2-3 weeks", "Becoming the standard for larger JavaScript projects."],
    ["React", "Intermediate", "4-6 weeks", "The most requested library for building web interfaces."],
    ["Next.js", "Intermediate", "3-4 weeks", "A popular React framework for production web apps."],
    ["Redux", "Intermediate", "2-3 weeks", "State management for larger React applications."],
    ["Tailwind CSS", "Beginner", "1-2 weeks", "A utility-first approach to fast, consistent styling."],
    ["Node.js", "Intermediate", "3-5 weeks", "Runs JavaScript on the server for APIs and tooling."],
    ["Python", "Intermediate", "4-6 weeks", "Widely used for backend services, automation and AI."],
    ["Java", "Advanced", "6-10 weeks", "Common in enterprise backend development."],
    ["Spring Boot", "Intermediate", "3-5 weeks", "Commonly used with Java for enterprise backend roles."],
    ["REST API", "Beginner", "2-3 weeks", "The standard way services talk to each other."],
    ["GraphQL", "Intermediate", "2-4 weeks", "A flexible query language for APIs."],
    ["Microservices", "Advanced", "4-8 weeks", "Splitting a system into small independently deployed services."],
    ["SQL", "Beginner", "2-4 weeks", "Needed for almost every data-driven application."],
    ["PostgreSQL", "Intermediate", "3-4 weeks", "A leading open-source relational database."],
    ["MongoDB", "Beginner", "2-3 weeks", "A popular document database in JavaScript stacks."],
    ["Redis", "Intermediate", "2-3 weeks", "In-memory storage used for caching and queues."],
    ["Machine Learning", "Advanced", "8-12 weeks", "The core of most AI engineering roles."],
    ["Deep Learning", "Advanced", "8-12 weeks", "Neural networks for vision, language and more."],
    ["PyTorch", "Advanced", "6-8 weeks", "A leading framework for deep learning."],
    ["TensorFlow", "Advanced", "6-8 weeks", "A widely used framework for machine learning."],
  ];
  const OVERRIDE_MAP = new Map(OVERRIDES.map(([name, difficulty, effort, about]) => [name, { difficulty, effort, about }]));
  
  export function skillMeta(name, category) {
    const base = CATEGORY_DEFAULTS[category] ?? { difficulty: "Intermediate", effort: "3-6 weeks" };
    const override = OVERRIDE_MAP.get(name);
    return {
      difficulty: override?.difficulty ?? base.difficulty,
      effort: override?.effort ?? base.effort,
      about: override?.about ?? `${name} is requested in many ${category ?? "technical"} roles.`,
    };
  }
  
  /** Describes where a detected skill shows up on the resume. */
  export function evidenceDescription(evidence) {
    if (evidence.experienceRoles > 0 && evidence.projects > 0) return "Used in both your work experience and your projects.";
    if (evidence.experienceRoles > 0) return "Used in your work experience.";
    if (evidence.projects > 0) return "Used in your projects.";
    return "Listed on your resume, but without an example of using it.";
  }
  
  export function recommendationFor({ name, detected, score, target }) {
    if (!detected) {
      return `1. Learn ${name} fundamentals\n2. Build a small project that uses ${name}\n3. Add it to your resume with what you built`;
    }
    if (score >= target) return `Keep using ${name} in larger projects to stay at this level.`;
    if (score <= 40) {
      return `Use ${name} in a project or at work and describe what you built, so your resume shows real use and not only a listing.`;
    }
    return `Go deeper with ${name} in a real project and add a measurable result to your resume.`;
  }