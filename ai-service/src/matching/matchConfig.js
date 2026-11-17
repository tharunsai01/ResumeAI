// All tunable numbers for matching live here.

export const AI_SCREENING_THRESHOLD = 80; // same value as the frontend
export const POTENTIAL_MATCH_MIN = 60;

// Recruiter-configurable. They are re-normalised, so they do not have to add up to 1.
export const DEFAULT_WEIGHTS = {
  skills: 0.5,
  experience: 0.2,
  education: 0.1,
  roleSimilarity: 0.2,
};

export const MATCH = {
  matchedMinScore: 50, // candidate skill score needed to count as "Matched" (below = "Partial")
  partialCredit: 0.5, // share of a skill's credit a "Partial" earns
  requiredShare: 0.8, // required skills vs preferred skills inside the skill score
  maxListItems: 5, // strengths / gaps shown per candidate
};