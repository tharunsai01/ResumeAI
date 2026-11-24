"""Resume analysis pipeline: text -> injection scan -> skills -> profile -> report."""

from __future__ import annotations

from app.extractors.resume_parser import parse_resume
from app.schemas.models import now_iso
from app.security.injection import scan
from app.services.llm import get_llm
from app.services.taxonomy import SkillTaxonomy


def detect_skills(text: str, taxonomy: SkillTaxonomy) -> dict:
    parsed = parse_resume(text, taxonomy)
    return {"skills": parsed["skills"], "unknown_skills": parsed["unknown_skills"]}


def analyze_profile(text: str, taxonomy: SkillTaxonomy) -> dict:
    parsed = parse_resume(text, taxonomy)
    return {k: parsed[k] for k in ("experience", "total_experience_years", "job_titles", "education",
                                   "highest_education_level", "highest_education_label")}


def build_report(text: str, taxonomy: SkillTaxonomy, hidden_text: list[str] | None = None, use_llm: bool = True) -> dict:
    security = scan(text, hidden_text, raw_text=text)
    parsed = parse_resume(text, taxonomy)
    llm = get_llm()
    llm_used = False
    llm_error = None

    # Suspicious documents never reach the LLM; deterministic parsing is enough
    # and a human will review the file.
    if use_llm and llm.available and not security["flagged"]:
        enriched = llm.extract_resume(text, taxonomy)
        if enriched is not None:
            llm_used = True
            known = {s["name"] for s in parsed["skills"]}
            for skill in enriched.skills:
                if skill not in known and taxonomy.canonical(skill):
                    parsed["skills"].append({"name": skill, "category": taxonomy.category(skill), "mentions": 1})
            if enriched.headline and not parsed["headline"]:
                parsed["headline"] = enriched.headline
            if enriched.summary and len(parsed["summary"]) < 40:
                parsed["summary"] = enriched.summary
            if enriched.suspicious_instructions:
                security["findings"].append({"type": "llm_reported_instructions", "severity": 3,
                                             "excerpt": "Extraction model reported embedded instructions"})
                security["risk_score"] = min(100, security["risk_score"] + 36)
                security["flagged"] = security["risk_score"] >= 40
                security["risk_level"] = "high" if security["risk_score"] >= 50 else "medium"
        else:
            llm_error = llm.last_error

    categories: dict[str, int] = {}
    for skill in parsed["skills"]:
        categories[skill["category"]] = categories.get(skill["category"], 0) + 1

    completeness_checks = {
        "contact": bool(parsed["contact"]["email"]),
        "summary": len(parsed["summary"]) >= 40,
        "skills": len(parsed["skills"]) >= 5,
        "experience": bool(parsed["experience"]) or parsed["total_experience_years"] > 0,
        "education": bool(parsed["education"]),
        "projects_or_certifications": bool(parsed["projects"] or parsed["certifications"]),
    }
    completeness = round(sum(completeness_checks.values()) / len(completeness_checks) * 100)
    suggestions = []
    if not completeness_checks["summary"]:
        suggestions.append("Add a 2-3 sentence professional summary describing your focus area.")
    if not completeness_checks["skills"]:
        suggestions.append("List your technical skills in a dedicated Skills section.")
    if not completeness_checks["experience"]:
        suggestions.append("Add dated work experience entries (e.g. 'Jan 2021 - Present').")
    if not completeness_checks["education"]:
        suggestions.append("Include your education with degree and institution.")
    if not completeness_checks["projects_or_certifications"]:
        suggestions.append("Add projects or certifications that show applied skills.")
    if parsed["unknown_skills"]:
        suggestions.append("Some listed skills were not recognised and were sent for taxonomy review.")

    return {
        "profile": parsed,
        "skill_categories": categories,
        "completeness": {"score": completeness, "checks": completeness_checks},
        "suggestions": suggestions,
        "security": security,
        "llm_used": llm_used,
        "llm_error": llm_error,
        "extraction_method": "groq+deterministic" if llm_used else "deterministic",
        "timestamp": now_iso(),
    }
