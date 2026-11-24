import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const config = {
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    // Change the model in .env (GROQ_MODEL) if Groq retires this one.
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    temperature: 0, // deterministic output -> stable scores
    seed: 42,
    maxTokens: 3000,
    retries: 1, // extra attempts if the model returns invalid JSON
    timeoutMs: 60000,
  },

  extraction: {
    maxResumeChars: 20000,
  },

  // How a skill's score (0-100) is computed from evidence. Max = 100.
  skillScoring: {
    mentioned: 30, // appears anywhere in the resume
    listed: 10, // listed in a skills section
    perExperienceRole: 12, // used in a job/internship
    maxExperience: 25,
    perProject: 10, // used in a project
    maxProjects: 20,
    perYear: 5, // years of roles that used it
    maxYears: 15,
  },

  // Score -> proficiency label
  levels: { expert: 85, advanced: 70, intermediate: 50 },
};