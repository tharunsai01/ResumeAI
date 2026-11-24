import { createHash } from "node:crypto";
import { redactText } from "./redact.js";
import { effectiveYears } from "../matching/scoreMatch.js";

/** A short, stable alias such as "Candidate 7F3A" for a candidate id. */
export function pseudonym(id) {
  const code = createHash("sha256").update(String(id ?? "unknown")).digest("hex").slice(0, 4).toUpperCase();
  return `Candidate ${code}`;
}

function roleLength(role, now) {
  if (role.startYear == null) return "";
  const end = role.isCurrent ? now.getFullYear() : (role.endYear ?? role.startYear);
  const years = Math.max(0, end - role.startYear);
  return years === 0 ? "Less than a year" : `${years} ${years === 1 ? "year" : "years"}`;
}

/**
 * What a recruiter sees in blind-screening mode: skills, experience and education only.
 * Removed: name, email, phone, location, links, company names, institution names and education dates.
 * options: { id, now, keepEducationDates }
 */
export function buildBlindProfile(analysis, options = {}) {
  const { id = null, now = new Date(), keepEducationDates = false } = options;
  const entities = {
    name: analysis.candidate.name,
    location: analysis.candidate.location,
    companies: analysis.experience.map((role) => role.company).filter(Boolean),
    institutions: analysis.education.map((item) => item.institution).filter(Boolean),
  };
  const redact = (value) => redactText(value, entities);

  return {
    id,
    label: pseudonym(id),
    experienceYears: effectiveYears(analysis.experienceYears),
    education: analysis.education.map((item) => ({
      degree: redact(item.degree),
      ...(keepEducationDates ? { duration: item.duration } : {}),
    })),
    skills: analysis.skills
      .filter((skill) => skill.known)
      .map(({ name, level, score, category }) => ({ name, level, score, category })),
    otherSkills: analysis.unknownSkills,
    roles: analysis.experience.map((role) => ({
      title: redact(role.title),
      length: roleLength(role, now),
      description: role.description.map(redact),
      technologies: role.technologies,
    })),
    projects: analysis.projects.map((project) => ({
      name: redact(project.name),
      techStack: project.techStack,
      description: redact(project.description),
    })),
    hidden: [
      "Name",
      "Email and phone",
      "Location",
      "Profile links",
      "Company names",
      "Institution names",
      ...(keepEducationDates ? [] : ["Education dates"]),
    ],
    limits: "Wording in free text (for example pronouns) is not changed.",
  };
}