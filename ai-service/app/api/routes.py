from __future__ import annotations

import time

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.config import get_settings
from app.core.security import require_internal_token
from app.embeddings.encoder import current_backend
from app.evaluation.fairness import run_evaluation
from app.extractors.document import DocumentError, extract_document
from app.extractors.job_parser import parse_job
from app.matching.scorer import compute_match
from app.schemas.models import (EvaluationRequest, JobExtractRequest, MatchRequest, RecommendRequest,
                                ScreenRequest, SkillGapRequest, TextRequest)
from app.security.injection import scan
from app.services.analysis import analyze_profile, build_report, detect_skills
from app.services.llm import get_llm
from app.services.taxonomy import get_taxonomy

public = APIRouter()
router = APIRouter(dependencies=[Depends(require_internal_token)])
STARTED = time.time()


def taxonomy_for(custom):
    return get_taxonomy().with_custom([c.model_dump() for c in custom] if custom else None)


@public.get("/health")
def health():
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "model_version": settings.model_version,
        "embedding_backend": current_backend(),
        "llm": {"provider": "groq", "model": settings.groq_model, "configured": get_llm().available},
        "uptime_seconds": round(time.time() - STARTED, 1),
    }


async def _read_upload(file: UploadFile) -> bytes:
    limit = get_settings().max_file_mb * 1024 * 1024
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(413, f"File exceeds {get_settings().max_file_mb} MB limit")
    return data


# --- resume pipeline (granular steps let the backend report real progress) -------

@router.post("/resume/extract-text")
async def resume_extract_text(file: UploadFile = File(...)):
    data = await _read_upload(file)
    try:
        doc = extract_document(data, file.filename)
    except DocumentError as exc:
        raise HTTPException(422, str(exc)) from exc
    return {"text": doc.text, "file_type": doc.file_type, "pages": doc.pages, "truncated": doc.truncated,
            "hidden_text": doc.hidden_text[:100], "security": scan(doc.text, doc.hidden_text, raw_text=doc.text)}


@router.post("/resume/skills")
def resume_skills(body: TextRequest):
    return detect_skills(body.text, taxonomy_for(body.custom_skills))


@router.post("/resume/profile")
def resume_profile(body: TextRequest):
    return analyze_profile(body.text, taxonomy_for(body.custom_skills))


@router.post("/resume/report")
def resume_report(body: TextRequest):
    return build_report(body.text, taxonomy_for(body.custom_skills), body.hidden_text, body.use_llm)


@router.post("/resume/analyze")
async def resume_analyze(file: UploadFile = File(...), use_llm: bool = Form(True)):
    """One-shot analysis: file in, full report out."""
    data = await _read_upload(file)
    try:
        doc = extract_document(data, file.filename)
    except DocumentError as exc:
        raise HTTPException(422, str(exc)) from exc
    report = build_report(doc.text, get_taxonomy(), doc.hidden_text, use_llm)
    report["document"] = {"file_type": doc.file_type, "pages": doc.pages, "truncated": doc.truncated, "characters": len(doc.text)}
    return report


# --- jobs & matching ---------------------------------------------------------------

@router.post("/jobs/extract")
def jobs_extract(body: JobExtractRequest):
    taxonomy = taxonomy_for(body.custom_skills)
    result = parse_job(body.title, body.description, taxonomy)
    result["security"] = scan(body.title + "\n" + body.description)
    return result


@router.post("/match")
def match(body: MatchRequest):
    taxonomy = taxonomy_for(body.custom_skills)
    result = compute_match(body.candidate, body.job, taxonomy)
    if body.include_narrative:
        llm = get_llm()
        if llm.available:
            facts = {k: result[k] for k in ("overall_score", "category", "components", "strengths", "gaps")}
            facts["job_title"] = body.job.title
            narrative = llm.explain_match(facts)
            if narrative:
                result["narrative"] = narrative.explanation
                result["recommendations"] = (result["recommendations"] + narrative.recommendations)[:6]
                result["llm_used"] = True
    return result


@router.post("/screen")
def screen(body: ScreenRequest):
    taxonomy = taxonomy_for(body.custom_skills)
    results = [compute_match(c, body.job, taxonomy) for c in body.candidates]
    results.sort(key=lambda r: (-r["overall_score"], -r["components"]["skills"]))
    for rank, result in enumerate(results, start=1):
        result["rank"] = rank
    return {"job_id": body.job.id, "count": len(results), "results": results}


@router.post("/recommend")
def recommend(body: RecommendRequest):
    taxonomy = taxonomy_for(body.custom_skills)
    results = [compute_match(body.candidate, j, taxonomy) for j in body.jobs]
    results.sort(key=lambda r: -r["overall_score"])
    return {"candidate_id": body.candidate.id, "results": results[: body.limit]}


@router.post("/skill-gap")
def skill_gap(body: SkillGapRequest):
    taxonomy = taxonomy_for(body.custom_skills)
    have = {(taxonomy.canonical(s) or s).lower() for s in body.candidate.skills}
    demand: dict[str, dict] = {}
    for job in body.jobs:
        for skill, required in [(s, True) for s in job.required_skills] + [(s, False) for s in job.preferred_skills]:
            canon = taxonomy.canonical(skill) or skill
            if canon.lower() in have:
                continue
            entry = demand.setdefault(canon, {"skill": canon, "category": taxonomy.category(canon), "required_in": 0, "preferred_in": 0, "bridges": []})
            entry["required_in" if required else "preferred_in"] += 1
    for entry in demand.values():
        entry["bridges"] = sorted(s for s in body.candidate.skills if taxonomy.are_related(entry["skill"], taxonomy.canonical(s) or s))[:3]
        entry["priority"] = entry["required_in"] * 2 + entry["preferred_in"] + (0.5 if entry["bridges"] else 0)
    gaps = sorted(demand.values(), key=lambda e: -e["priority"])
    by_category: dict[str, int] = {}
    for skill in body.candidate.skills:
        cat = taxonomy.category(taxonomy.canonical(skill) or skill)
        by_category[cat] = by_category.get(cat, 0) + 1
    learning = [
        {"skill": g["skill"], "reason": f"Required in {g['required_in']} and preferred in {g['preferred_in']} of the analysed jobs",
         "path": (f"Start from your {g['bridges'][0]} experience" if g["bridges"] else "Start with official docs and a small project")}
        for g in gaps[:6]
    ]
    return {"gaps": gaps[:25], "candidate_categories": by_category, "learning_recommendations": learning,
            "jobs_analysed": len(body.jobs)}


@router.post("/evaluation/run")
def evaluation(body: EvaluationRequest):
    return run_evaluation(body, taxonomy_for(body.custom_skills))


@router.post("/security/scan")
def security_scan(body: TextRequest):
    return scan(body.text, body.hidden_text, raw_text=body.text)
