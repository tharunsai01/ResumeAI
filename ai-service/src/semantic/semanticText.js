import { SEMANTIC } from "./semanticConfig.js";

// The texts that get embedded. They are built from the structured analysis,
// so name, email, location, company and institution are never included.

const clip = (text) => text.slice(0, SEMANTIC.maxChars);

export function resumeSemanticText(analysis) {
  const titles = [...new Set(analysis.experience.map((role) => role.title).filter(Boolean))];
  const skills = analysis.skills.slice(0, 15).map((skill) => skill.name); // already sorted by score
  const bullets = analysis.experience.flatMap((role) => role.description.slice(0, 3));
  const projects = analysis.projects.map((project) =>
    [project.name, project.description, project.techStack.join(", ")].filter(Boolean).join(" - ")
  );

  const parts = [];
  if (titles.length > 0) parts.push(`Roles: ${titles.join("; ")}.`);
  if (skills.length > 0) parts.push(`Skills: ${skills.join(", ")}.`);
  if (bullets.length > 0) parts.push(bullets.join(" "));
  if (projects.length > 0) parts.push(`Projects: ${projects.join("; ")}.`);
  return clip(parts.join(" "));
}

export function jobSemanticText(job) {
  const required = job.required.map((skill) => skill.name);
  const preferred = job.preferred.map((skill) => skill.name);

  const parts = [`${job.title}.`];
  if (required.length > 0) parts.push(`Required skills: ${required.join(", ")}.`);
  if (preferred.length > 0) parts.push(`Preferred skills: ${preferred.join(", ")}.`);
  if (job.description) parts.push(job.description);
  if (job.responsibilities.length > 0) parts.push(job.responsibilities.join(" "));
  return clip(parts.join(" "));
}