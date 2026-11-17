// Turns the free-text experience/education requirements of a job into numbers.

const before = "(?<![a-z0-9])";
const after = "(?![a-z0-9])";

// ---------- experience ----------

/** "2–4 years" -> {min:2,max:4}; "5+ Years" -> {min:5,max:null}; "Fresher" -> {min:0,max:1} */
export function parseExperienceRange(input) {
  const s = String(input ?? "").toLowerCase().replace(/[–—]/g, "-").trim();
  if (!s) return null;

  let m = s.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };

  m = s.match(/(\d+(?:\.\d+)?)\s*\+/);
  if (m) return { min: Number(m[1]), max: null };

  m = s.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/);
  if (m) return { min: Number(m[1]), max: null };

  if (/fresher|entry|no experience|graduate/.test(s)) return { min: 0, max: 1 };
  return null;
}

/** 0-100. Inside the range = 100, short = proportional, far above = small penalty. */
export function experienceScore(years, range) {
  if (!range) return null;
  const { min, max } = range;
  if (years < min) return min === 0 ? 100 : Math.round((100 * years) / min);
  if (max !== null && years > max) return Math.max(70, 100 - 10 * Math.ceil(years - max));
  return 100;
}

// ---------- education ----------

const LEVEL_PATTERNS = [
  [5, new RegExp(`${before}(?:ph\\.?\\s?d|doctorate)${after}`)],
  [
    4,
    new RegExp(
      `${before}(?:m\\.\\s?[a-z]{1,8}\\.?|mtech|msc|mca|mba|mcom|masters?|master's|master of|ms(?=\\s+(?:in|degree)))${after}`
    ),
  ],
  [
    3,
    new RegExp(
      `${before}(?:b\\.\\s?[a-z]{1,8}\\.?|btech|bsc|bca|bba|bcom|bachelors?|bachelor's|bachelor of|bs(?=\\s+(?:in|degree))|undergraduate|graduate degree|graduation)${after}`
    ),
  ],
  [2, new RegExp(`${before}(?:diploma|polytechnic)${after}`)],
];

const TECH_FIELD = new RegExp(
  `${before}(?:computer|software|information technology|information systems|it|cs|cse|data science|artificial intelligence|ai|machine learning|cyber ?security)${after}`
);

/** Lowest degree level a job text asks for: 3 = bachelor, 4 = master... null if none. */
export function requiredEducationLevel(jobEducation) {
  const text = String(jobEducation ?? "").toLowerCase();
  if (!text.trim()) return null;
  const found = LEVEL_PATTERNS.filter(([, re]) => re.test(text)).map(([level]) => level);
  if (found.length > 0) return Math.min(...found);
  return /degree|graduate/.test(text) ? 3 : null;
}

/** Highest degree level among the candidate's degrees (0 if none are recognised). */
export function candidateEducationLevel(degrees) {
  let best = 0;
  for (const degree of degrees) {
    const text = String(degree).toLowerCase();
    for (const [level, re] of LEVEL_PATTERNS) {
      if (re.test(text)) best = Math.max(best, level);
    }
  }
  return best;
}

function fieldScore(jobEducation, degrees) {
  const job = String(jobEducation).toLowerCase();
  if (!TECH_FIELD.test(job)) return 100; // the job names no field
  if (TECH_FIELD.test(degrees.join(" | ").toLowerCase())) return 100;
  return /equivalent|related|relevant/.test(job) ? 70 : 40;
}

/** 0-100, or null when the job states no education requirement. */
export function educationScore(jobEducation, degrees) {
  const required = requiredEducationLevel(jobEducation);
  if (required === null) return null;
  const level = candidateEducationLevel(degrees);
  if (level === 0) return 0;
  const levelPart = level >= required ? 100 : level === required - 1 ? 60 : 20;
  return Math.round(0.7 * levelPart + 0.3 * fieldScore(jobEducation, degrees));
}