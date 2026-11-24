"""Request/response schemas.

Inputs use extra="ignore": any protected attribute a caller sends (gender,
age, ethnicity, religion, marital status, nationality, photo, name...) is
dropped before it can reach scoring code.
"""

from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field


class Strict(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


class ExperienceItem(Strict):
    title: str = Field(default="", max_length=150)
    months: int = Field(default=0, ge=0, le=720)


class CustomSkill(Strict):
    name: str = Field(max_length=80)
    category: str = Field(default="Other", max_length=60)
    aliases: list[str] = Field(default_factory=list, max_length=20)
    related: list[str] = Field(default_factory=list, max_length=20)


class CandidateInput(Strict):
    id: str | None = Field(default=None, max_length=64)
    headline: str = Field(default="", max_length=200)
    summary: str = Field(default="", max_length=3000)
    skills: list[str] = Field(default_factory=list, max_length=150)
    job_titles: list[str] = Field(default_factory=list, max_length=20)
    total_experience_years: float = Field(default=0, ge=0, le=60)
    experience: list[ExperienceItem] = Field(default_factory=list, max_length=30)
    highest_education_level: int = Field(default=0, ge=0, le=5)
    education_field: str = Field(default="", max_length=120)


class JobInput(Strict):
    id: str | None = Field(default=None, max_length=64)
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=20000)
    required_skills: list[str] = Field(default_factory=list, max_length=60)
    preferred_skills: list[str] = Field(default_factory=list, max_length=60)
    min_experience_years: float = Field(default=0, ge=0, le=40)
    education_level: int = Field(default=0, ge=0, le=5)
    education_required: bool = False


class MatchRequest(Strict):
    candidate: CandidateInput
    job: JobInput
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)
    include_narrative: bool = False


class ScreenRequest(Strict):
    job: JobInput
    candidates: list[CandidateInput] = Field(max_length=500)
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)


class RecommendRequest(Strict):
    candidate: CandidateInput
    jobs: list[JobInput] = Field(max_length=500)
    limit: int = Field(default=10, ge=1, le=100)
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)


class SkillGapRequest(Strict):
    candidate: CandidateInput
    jobs: list[JobInput] = Field(min_length=1, max_length=50)
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)


class JobExtractRequest(Strict):
    title: str = Field(max_length=200)
    description: str = Field(max_length=20000)
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)


class TextRequest(Strict):
    text: str = Field(max_length=100_000)
    hidden_text: list[str] = Field(default_factory=list, max_length=200)
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)
    use_llm: bool = True


class EvaluationCandidate(CandidateInput):
    # group labels are used ONLY to measure outcomes in fairness reports,
    # never passed to scoring.
    group: str | None = Field(default=None, max_length=40)


class EvaluationRequest(Strict):
    job: JobInput
    candidates: list[EvaluationCandidate] = Field(min_length=1, max_length=1000)
    shortlist_threshold: float = Field(default=60, ge=0, le=100)
    custom_skills: list[CustomSkill] = Field(default_factory=list, max_length=500)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
