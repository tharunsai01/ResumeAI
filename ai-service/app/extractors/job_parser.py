"""Deterministic job description parser."""

from __future__ import annotations

import re

from app.extractors.resume_parser import degree_level
from app.services.taxonomy import SkillTaxonomy

REQUIRED_HEADINGS = re.compile(r"^(requirements|required|must[- ]have|qualifications|what you('ll)? need|minimum qualifications|you have|skills required|required skills)\b", re.I)
PREFERRED_HEADINGS = re.compile(r"^(nice[- ]to[- ]have|preferred|bonus|good to have|plus|preferred qualifications|desirable|preferred skills)\b", re.I)
OTHER_HEADINGS = re.compile(r"^(responsibilities|what you('ll)? do|about (us|the role)|benefits|perks|the role|overview|role overview)\b", re.I)
YEARS_RX = re.compile(r"(\d{1,2})\s*\+?\s*(?:-|to|–)?\s*(\d{1,2})?\s*\+?\s*years?", re.I)


def parse_job(title: str, description: str, taxonomy: SkillTaxonomy) -> dict:
    bucket = "general"
    buckets: dict[str, list[str]] = {"general": [], "required": [], "preferred": []}
    for raw in description.split("\n"):
        line = raw.strip().strip("#*").strip()
        if not line:
            continue
        head = line.rstrip(":").strip()
        if len(head) < 50 and REQUIRED_HEADINGS.match(head):
            bucket = "required"
            continue
        if len(head) < 50 and PREFERRED_HEADINGS.match(head):
            bucket = "preferred"
            continue
        if len(head) < 50 and OTHER_HEADINGS.match(head):
            bucket = "general"
            continue
        # inline hints override section
        if re.search(r"\b(nice to have|preferred|a plus|bonus|is a plus)\b", line, re.I):
            buckets["preferred"].append(line)
        else:
            buckets[bucket].append(line)

    required = set(taxonomy.extract("\n".join(buckets["required"] + buckets["general"])))
    required |= set(taxonomy.extract(title))
    preferred = set(taxonomy.extract("\n".join(buckets["preferred"]))) - required

    min_years = 0
    for m in YEARS_RX.finditer(description):
        context = description[m.end(): m.end() + 40].lower()
        if "experience" in context or "exp" in context or "in " in context[:5]:
            min_years = max(min_years, int(m.group(1)))
    level, label = degree_level(description)
    mode = "remote" if re.search(r"\bremote\b", description, re.I) else "hybrid" if re.search(r"\bhybrid\b", description, re.I) else "onsite"

    return {
        "title": title.strip()[:150],
        "required_skills": sorted(required),
        "preferred_skills": sorted(preferred),
        "min_experience_years": min(min_years, 30),
        "education_level": level,
        "education_label": label,
        "work_mode_hint": mode,
    }
