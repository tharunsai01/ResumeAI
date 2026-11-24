"""Fairness, stability and model-comparison evaluation.

* Counterfactual invariance: identical profiles that differ only in
  identity-signalling text must get identical scores.
* Adverse impact: shortlist rate per group (if the caller supplies group
  labels for evaluation), checked against the four-fifths rule.
* Stability: harmless rewrites (skill order, casing, whitespace) must not move scores.
* Model comparison: role scores from the active encoder vs the TF-IDF baseline.
"""

from __future__ import annotations

import random
import statistics

import numpy as np

from app.embeddings.encoder import TfidfEncoder, calibrated, get_encoder
from app.matching.scorer import compute_match, role_texts
from app.schemas.models import CandidateInput, EvaluationRequest, now_iso
from app.services.taxonomy import SkillTaxonomy

IDENTITY_SWAPS = [
    ("he ", "she "), (" his ", " her "), ("Mr. ", "Ms. "), ("father", "mother"), ("husband", "wife"),
    ("Mohammed", "Emily"), ("Rahul", "Priya"), ("John", "Aisha"),
]


def _counterfactual(candidate: CandidateInput) -> CandidateInput:
    summary = candidate.summary
    for a, b in IDENTITY_SWAPS:
        summary = summary.replace(a, b) if a in summary else summary.replace(b, a)
    return candidate.model_copy(update={"summary": summary + " Member of a women in tech network. Age 52."})


def _benign(candidate: CandidateInput, rng: random.Random) -> CandidateInput:
    skills = list(candidate.skills)
    rng.shuffle(skills)
    skills = [s.upper() if rng.random() < 0.3 else s for s in skills]
    return candidate.model_copy(update={"skills": skills, "headline": "  " + candidate.headline + "  "})


def _spearman(a: list[float], b: list[float]) -> float | None:
    if len(a) < 3:
        return None
    ra, rb = np.argsort(np.argsort(a)), np.argsort(np.argsort(b))
    if np.std(ra) == 0 or np.std(rb) == 0:
        return None
    return float(np.corrcoef(ra, rb)[0, 1])


def run_evaluation(request: EvaluationRequest, taxonomy: SkillTaxonomy) -> dict:
    rng = random.Random(42)
    rows = []
    for item in request.candidates:
        base = CandidateInput.model_validate(item.model_dump(exclude={"group"}))
        result = compute_match(base, request.job, taxonomy)
        cf = compute_match(_counterfactual(base), request.job, taxonomy)
        benign = compute_match(_benign(base, rng), request.job, taxonomy)
        rows.append({
            "id": base.id,
            "group": item.group,
            "score": result["overall_score"],
            "category": result["category"],
            "components": result["components"],
            "counterfactual_delta": round(abs(cf["overall_score"] - result["overall_score"]), 3),
            "stability_delta": round(abs(benign["overall_score"] - result["overall_score"]), 3),
            "validated": result["validated"],
        })

    scores = [r["score"] for r in rows]
    buckets = {f"{lo}-{lo + 9}": 0 for lo in range(0, 100, 10)}
    for s in scores:
        lo = min(90, int(s // 10) * 10)
        buckets[f"{lo}-{lo + 9}"] += 1

    # adverse impact (four-fifths rule)
    groups: dict[str, list[float]] = {}
    for r in rows:
        if r["group"]:
            groups.setdefault(r["group"], []).append(r["score"])
    group_stats = {}
    for name, vals in groups.items():
        rate = sum(v >= request.shortlist_threshold for v in vals) / len(vals)
        group_stats[name] = {"count": len(vals), "mean_score": round(statistics.mean(vals), 2), "selection_rate": round(rate, 3)}
    impact = None
    if len(group_stats) >= 2:
        rates = [g["selection_rate"] for g in group_stats.values()]
        top = max(rates)
        ratio = (min(rates) / top) if top > 0 else 1.0
        impact = {"ratio": round(ratio, 3), "passes_four_fifths_rule": ratio >= 0.8}

    # model comparison on the role component
    active = get_encoder()
    baseline = TfidfEncoder()
    active_scores, baseline_scores = [], []
    for item in request.candidates[:200]:
        cand_text, job_text = role_texts(item, request.job)
        active_scores.append(calibrated(active.similarity(cand_text, job_text), active))
        baseline_scores.append(calibrated(baseline.similarity(cand_text, job_text), baseline))
    comparison = {
        "active_backend": active.name,
        "baseline_backend": baseline.name,
        "mean_abs_difference": round(float(np.mean(np.abs(np.array(active_scores) - np.array(baseline_scores)))), 2),
        "rank_correlation": _spearman(active_scores, baseline_scores),
    }

    cf_deltas = [r["counterfactual_delta"] for r in rows]
    st_deltas = [r["stability_delta"] for r in rows]
    return {
        "job_id": request.job.id,
        "candidate_count": len(rows),
        "score_distribution": {
            "mean": round(statistics.mean(scores), 2),
            "median": round(statistics.median(scores), 2),
            "stdev": round(statistics.pstdev(scores), 2),
            "min": min(scores),
            "max": max(scores),
            "histogram": buckets,
            "categories": {c: sum(r["category"] == c for r in rows) for c in ("Strong Match", "Potential Match", "Low Match")},
        },
        "counterfactual_fairness": {
            "max_delta": max(cf_deltas),
            "passed": max(cf_deltas) == 0,
            "description": "Identity-signalling text (names, pronouns, age, affinity groups) was swapped; scores must not change.",
        },
        "stability": {"max_delta": max(st_deltas), "mean_delta": round(statistics.mean(st_deltas), 3), "passed": max(st_deltas) <= 0.5},
        "adverse_impact": impact,
        "group_stats": group_stats,
        "formula_validation": {"all_valid": all(r["validated"] for r in rows)},
        "model_comparison": comparison,
        "results": rows,
        "timestamp": now_iso(),
    }
