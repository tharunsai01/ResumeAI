// The frontend's job-board "Job" has an unstructured `skills` list that mixes technical and
// soft skills. These helpers turn it into the structured job shape that matching understands.

const SOFT_SKILLS = new Set([
    "communication", "problem solving", "problem-solving", "teamwork", "leadership", "time management",
    "adaptability", "critical thinking", "collaboration", "creativity", "work ethic", "attention to detail",
    "interpersonal skills", "decision making", "stakeholder management", "ownership",
  ]);
  
  export function fromBoardJob(job) {
    const skills = (Array.isArray(job?.skills) ? job.skills : []).filter(
      (skill) => typeof skill === "string" && !SOFT_SKILLS.has(skill.toLowerCase().trim())
    );
    const requirements = Array.isArray(job?.requirements) ? job.requirements : [];
    const degreeLine = requirements.find((line) => /degree|b\.?\s?tech|bachelor|master/i.test(line)) ?? "";
  
    return {
      id: job?.id,
      title: job?.title ?? "",
      requiredSkills: skills,
      preferredSkills: [],
      experience: job?.experience ?? "",
      education: degreeLine,
      description: job?.description ?? "",
      responsibilities: Array.isArray(job?.responsibilities) ? job.responsibilities : [],
    };
  }
  
  /** Accepts either a structured job (has requiredSkills) or a frontend board job. */
  export function toMatchJob(job) {
    return Array.isArray(job?.requiredSkills) ? job : fromBoardJob(job);
  }