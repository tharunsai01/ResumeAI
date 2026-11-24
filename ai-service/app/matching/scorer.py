"""Official HireSmart matching algorithm.

    overall = skills*0.50 + experience*0.20 + education*0.10 + role*0.20

Every component is a deterministic function of structured inputs. The LLM can
add a narrative explanation but can never change any number.
"""

from __future__ import annotations

import math
import re

from app.core.config import get_settings
from app.embeddings.encoder import calibrated, get_encoder
from app.schemas.models import CandidateInput, JobInput, now_iso
from app.services.taxonomy import SkillTaxonomy

WEIGHTS = {"skills": 0.50, "experience": 0.20, "education": 0.10, "role": 0.20}
CREDIT = {"exact": 1.0, "alias": 1.0, "related": 0.5, "missing": 0.0}
EDU_LABELS = {0: "not specified", 1: "high school", 2: "associate/diploma", 3: "bachelor's", 4: "master's", 5: "doctorate"}


def category_for(score: float) -> str:
    if score >= 80:
        return "Strong Match"
    if score >= 60:
        return "Potential Match"
    return "Low Match"


def _r(value: float) -> float:
    return round(float(value), 2)


# --- components -----------------------------------------------------------------

def score_skills(candidate: CandidateInput, job: JobInput, taxonomy: SkillTaxonomy) -> dict:
    cand_map: dict[str, str] = {}  # canonical -> raw form used by candidate
    for raw in candidate.skills:
        canon = taxonomy.canonical(raw) or raw.strip()
        cand_map.setdefault(canon.lower(), raw.strip())
    cand_canon = {k for k in cand_map}

    def evaluate(skills: list[str], required: bool):
        rows, credits = [], []
        seen = set()
        for raw in skills:
            canon = taxonomy.canonical(raw) or raw.strip()
            key = canon.lower()
            if not key or key in seen:
                continue
            seen.add(key)
            if key in cand_canon:
                cand_raw = cand_map[key]
                kind = "exact" if cand_raw.lower() == canon.lower() else "alias"
                rows.append({"skill": canon, "candidate_skill": cand_raw, "match_type": kind, "required": required})
            else:
                cat = taxonomy.category(canon)
                related = sorted((c for c in cand_canon if taxonomy.are_related(canon, taxonomy.canonical(c) or c)),
                                 key=lambda c: (taxonomy.category(taxonomy.canonical(c) or c) != cat, c))
                if related:
                    kind = "related"
                    rows.append({"skill": canon, "candidate_skill": cand_map[related[0]], "match_type": kind, "required": required})
                else:
                    kind = "missing"
                    rows.append({"skill": canon, "candidate_skill": None, "match_type": kind, "required": required})
            credits.append(CREDIT[kind])
        return rows, (sum(credits) / len(credits) * 100 if credits else None)

    req_rows, req_score = evaluate(job.required_skills, True)
    pref_rows, pref_score = evaluate(job.preferred_skills, False)
    if req_score is None and pref_score is None:
        score, note = 100.0, "Job lists no skills"
    elif pref_score is None:
        score, note = req_score, None
    elif req_score is None:
        score, note = pref_score, None
    else:
        score, note = 0.8 * req_score + 0.2 * pref_score, None
    return {"score": _r(score), "rows": req_rows + pref_rows, "required_score": req_score, "preferred_score": pref_score, "note": note}


def score_experience(candidate: CandidateInput, job: JobInput, title_sim) -> dict:
    required = job.min_experience_years
    total = candidate.total_experience_years
    if candidate.experience:
        relevant_months = sum(item.months for item in candidate.experience if item.title and title_sim(item.title) >= 50)
        relevant = relevant_months / 12
    else:
        relevant = total
    if required <= 0:
        return {"score": 100.0, "required": 0, "total": total, "relevant": _r(relevant), "note": "No minimum experience required"}
    total_ratio = min(1.0, total / required)
    relevant_ratio = min(1.0, relevant / required)
    score = (0.7 * total_ratio + 0.3 * relevant_ratio) * 100
    return {"score": _r(score), "required": required, "total": total, "relevant": _r(relevant), "note": None}


def score_education(candidate: CandidateInput, job: JobInput) -> dict:
    need, have = job.education_level, candidate.highest_education_level
    if need == 0:
        return {"score": 100.0, "note": "No education requirement"}
    if have == 0:
        if job.education_required:
            return {"score": 50.0, "note": "Education not stated; recruiter should verify"}
        return {"score": 100.0, "note": "Education not stated; optional for this job, so not penalised"}
    if have >= need:
        return {"score": 100.0, "note": None}
    score = max(0.0, 100 - 25 * (need - have))
    if not job.education_required:
        score = max(score, 60.0)
    return {"score": _r(score), "note": None}


PROTECTED_RX = re.compile(
    r"\b(he|she|him|her|his|hers|mr|mrs|ms|miss|male|female|man|woman|men|women|married|single|divorced|"
    r"mother|father|wife|husband|age\s*\d+|\d+\s*(years|yrs)\s*old|born\s+(in\s+)?\d{4}|christian|muslim|hindu|"
    r"jewish|sikh|buddhist|catholic|pregnan\w*|disabled|disability|nationality|citizen)\b",
    re.IGNORECASE,
)


def scrub(text: str) -> str:
    return PROTECTED_RX.sub(" ", text)


def role_texts(candidate: CandidateInput, job: JobInput) -> tuple[str, str]:
    # The free-text summary is deliberately excluded: it is the most likely
    # place for names, pronouns, age and other protected signals to leak in.
    # Skills are de-duplicated, lower-cased and sorted so list order or casing
    # can never change the semantic score.
    skills = sorted({s.strip().lower() for s in candidate.skills if s.strip()})[:25]
    job_skills = sorted({s.strip().lower() for s in job.required_skills if s.strip()})[:25]
    def norm(value: str) -> str:
        return " ".join(value.split())

    cand = ". ".join(filter(None, [norm(scrub(candidate.headline)), ", ".join(norm(scrub(t)) for t in candidate.job_titles),
                                   "Skills: " + ", ".join(skills)]))
    job_text = ". ".join(filter(None, [norm(job.title), norm(job.description[:1200]), "Skills: " + ", ".join(job_skills)]))
    return " ".join(cand.split()), " ".join(job_text.split())


def score_role(candidate: CandidateInput, job: JobInput) -> tuple[dict, callable]:
    encoder = get_encoder()

    def title_sim(title: str) -> float:
        return calibrated(encoder.similarity(" ".join(title.split()), job.title), encoder)

    titles = [scrub(t).strip() for t in ([candidate.headline] + candidate.job_titles) if t and scrub(t).strip()]
    best_title = max((title_sim(t) for t in titles), default=0.0)
    cand_text, job_text = role_texts(candidate, job)
    profile = calibrated(encoder.similarity(cand_text, job_text), encoder)
    score = 0.5 * best_title + 0.5 * profile if titles else profile
    return {"score": _r(score), "title_similarity": _r(best_title), "profile_similarity": _r(profile), "backend": encoder.name}, title_sim


# --- assembly --------------------------------------------------------------------

def overall_from(components: dict[str, float]) -> float:
    return _r(sum(components[k] * w for k, w in WEIGHTS.items()))


def validate_result(result: dict) -> bool:
    """Independent check that a result obeys the official formula and bounds."""
    comps = result["components"]
    if set(comps) != set(WEIGHTS):
        return False
    if any(not (0 <= v <= 100) or math.isnan(v) for v in comps.values()):
        return False
    expected = overall_from(comps)
    return abs(expected - result["overall_score"]) < 0.011 and result["category"] == category_for(result["overall_score"])


def compute_match(candidate: CandidateInput, job: JobInput, taxonomy: SkillTaxonomy) -> dict:
    role, title_sim = score_role(candidate, job)
    skills = score_skills(candidate, job, taxonomy)
    experience = score_experience(candidate, job, title_sim)
    education = score_education(candidate, job)
    components = {"skills": skills["score"], "experience": experience["score"],
                  "education": education["score"], "role": role["score"]}
    overall = overall_from(components)

    rows = skills["rows"]
    matched = [r for r in rows if r["match_type"] in ("exact", "alias")]
    related = [r for r in rows if r["match_type"] == "related"]
    missing = [r for r in rows if r["match_type"] == "missing"]

    strengths, gaps = [], []
    if matched:
        req_matched = [r["skill"] for r in matched if r["required"]]
        if req_matched:
            strengths.append(f"Has {len(req_matched)} of {len([r for r in rows if r['required']])} required skills: {', '.join(req_matched[:6])}")
    if experience["required"] and experience["total"] >= experience["required"]:
        strengths.append(f"{experience['total']:g} years of experience meets the {experience['required']:g}-year requirement")
    if role["score"] >= 70:
        strengths.append("Previous roles are closely aligned with this position")
    if education["score"] == 100 and job.education_level:
        strengths.append(f"Meets the {EDU_LABELS[job.education_level]} education requirement")
    req_missing = [r["skill"] for r in missing if r["required"]]
    if req_missing:
        gaps.append(f"Missing required skills: {', '.join(req_missing[:6])}")
    if related:
        gaps.append("Related but not exact experience with: " + ", ".join(f"{r['skill']} (has {r['candidate_skill']})" for r in related[:4]))
    if experience["required"] and experience["total"] < experience["required"]:
        gaps.append(f"{experience['total']:g} years of experience against a {experience['required']:g}-year requirement")
    if education["note"] and "verify" in education["note"]:
        gaps.append(education["note"])
    elif education["score"] < 100:
        gaps.append(f"Education below the {EDU_LABELS[job.education_level]} requirement")
    if role["score"] < 40:
        gaps.append("Previous roles differ noticeably from this position")

    recommendations = []
    for skill in req_missing[:3]:
        bridge = [r["candidate_skill"] for r in related if r["skill"] == skill]
        if bridge:
            recommendations.append(f"Build on {bridge[0]} to pick up {skill}")
        else:
            recommendations.append(f"Learn {skill} with a small hands-on project and add it to your resume")
    for r in related[:2]:
        recommendations.append(f"Show direct {r['skill']} work; related {r['candidate_skill']} experience counts only partially")

    category = category_for(overall)
    explanation = (
        f"{category} ({overall:.1f}/100). Skills {components['skills']:.0f} (50% weight): "
        f"{len(matched)} matched, {len(related)} related, {len(missing)} missing. "
        f"Experience {components['experience']:.0f} (20%): {experience['total']:g} yrs vs {experience['required']:g} required. "
        f"Education {components['education']:.0f} (10%). Role similarity {components['role']:.0f} (20%)."
    )

    result = {
        "candidate_id": candidate.id,
        "job_id": job.id,
        "overall_score": overall,
        "category": category,
        "components": components,
        "weights": WEIGHTS,
        "matched_skills": matched,
        "related_skills": related,
        "missing_skills": missing,
        "strengths": strengths,
        "gaps": gaps,
        "explanation": explanation,
        "recommendations": recommendations,
        "details": {
            "skills": {k: skills[k] for k in ("required_score", "preferred_score", "note")},
            "experience": experience,
            "education": education,
            "role": role,
        },
        "model_version": get_settings().model_version,
        "embedding_backend": role["backend"],
        "llm_used": False,
        "timestamp": now_iso(),
    }
    result["validated"] = validate_result(result)
    return result
