import pytest

from app.embeddings.encoder import TfidfEncoder, calibrated
from app.matching.scorer import WEIGHTS, category_for, compute_match, overall_from, validate_result
from app.schemas.models import CandidateInput, JobInput
from app.services.taxonomy import get_taxonomy

JOB = JobInput(
    id="job1", title="Senior Full-Stack Engineer",
    description="Build React and Node.js features for a recruitment SaaS.",
    required_skills=["React", "Node.js", "MongoDB", "TypeScript"], preferred_skills=["Docker", "Kubernetes"],
    min_experience_years=5, education_level=3, education_required=False,
)


def candidate(**kw):
    base = dict(id="c1", headline="Senior Full-Stack Engineer", job_titles=["Senior Software Engineer"],
                skills=["ReactJS", "Node.js", "MongoDB", "TypeScript", "Docker"], total_experience_years=6,
                highest_education_level=3)
    base.update(kw)
    return CandidateInput(**base)


def test_weights_are_official():
    assert WEIGHTS == {"skills": 0.50, "experience": 0.20, "education": 0.10, "role": 0.20}
    assert sum(WEIGHTS.values()) == pytest.approx(1.0)


def test_formula_calculation():
    assert overall_from({"skills": 80, "experience": 100, "education": 50, "role": 70}) == 40 + 20 + 5 + 14


@pytest.mark.parametrize("score,category", [(100, "Strong Match"), (80, "Strong Match"), (79.99, "Potential Match"),
                                            (60, "Potential Match"), (59.99, "Low Match"), (0, "Low Match")])
def test_categories(score, category):
    assert category_for(score) == category


def test_strong_candidate_scores_high_and_validates():
    result = compute_match(candidate(), JOB, get_taxonomy())
    assert result["validated"] is True
    # required 4/4; preferred: Docker exact (1.0) + Kubernetes related via Docker (0.5) => 75
    assert result["components"]["skills"] == pytest.approx(0.8 * 100 + 0.2 * 75)
    assert result["components"]["experience"] == 100
    assert result["components"]["education"] == 100
    kinds = {r["skill"]: r["match_type"] for r in result["matched_skills"]}
    assert kinds["React"] == "alias" and kinds["Node.js"] == "exact"
    assert [r["skill"] for r in result["related_skills"]] == ["Kubernetes"]
    assert result["missing_skills"] == []
    for key in ("overall_score", "components", "matched_skills", "missing_skills", "strengths", "gaps",
                "explanation", "model_version", "timestamp"):
        assert key in result


def test_related_skill_gets_partial_credit():
    result = compute_match(candidate(skills=["Vue.js", "Node.js", "MongoDB", "TypeScript"]), JOB, get_taxonomy())
    related = {r["skill"]: r["candidate_skill"] for r in result["related_skills"]}
    assert related.get("React") == "Vue.js"
    # 3 exact + 1 related of 4 required => 87.5; preferred: Docker missing (Kubernetes related to Docker? no)
    assert result["details"]["skills"]["required_score"] == pytest.approx(87.5)


def test_experience_shortfall_scales():
    result = compute_match(candidate(total_experience_years=2.5), JOB, get_taxonomy())
    assert result["components"]["experience"] == pytest.approx(50.0)
    assert any("years of experience against" in g for g in result["gaps"])


def test_missing_optional_education_not_penalised():
    result = compute_match(candidate(highest_education_level=0), JOB, get_taxonomy())
    assert result["components"]["education"] == 100


def test_missing_required_education_flagged_for_review():
    job = JOB.model_copy(update={"education_required": True})
    result = compute_match(candidate(highest_education_level=0), job, get_taxonomy())
    assert result["components"]["education"] == 50
    assert any("verify" in g for g in result["gaps"])


def test_semantic_similarity_orders_roles():
    enc = TfidfEncoder()
    close = calibrated(enc.similarity("Senior Full-Stack Engineer", "Full Stack Software Engineer"), enc)
    far = calibrated(enc.similarity("Pastry Chef", "Full Stack Software Engineer"), enc)
    assert close > far


def test_unrelated_candidate_is_low_match():
    weak = candidate(headline="Pastry Chef", job_titles=["Pastry Chef"], skills=["Baking"], total_experience_years=1,
                     highest_education_level=1)
    result = compute_match(weak, JOB, get_taxonomy())
    assert result["category"] == "Low Match"


def test_protected_attributes_are_dropped():
    data = candidate().model_dump()
    data.update({"gender": "female", "age": 61, "ethnicity": "x", "religion": "y"})
    parsed = CandidateInput.model_validate(data)
    assert not hasattr(parsed, "gender") and "age" not in parsed.model_dump()


def test_tampered_result_fails_validation():
    result = compute_match(candidate(), JOB, get_taxonomy())
    result["overall_score"] = 99.0
    assert validate_result(result) is False
