"""Skill taxonomy: canonical names, aliases, categories and related skills."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "skills.json"

# Short names that collide with ordinary words or letters. They are only
# recognised when they appear as an explicit item in a skills list.
AMBIGUOUS = {"c", "r", "go", "rest", "spark", "spring", "shell", "node", "ui", "ux", "cv", "dl", "ml", "tf", "ts", "js",
             "py", "rails", "nest", "security", "analytics", "containers", "kanban", "torch", "elk", "unix", "rag", "sso",
             "jwt", "jira", "sketch", "apollo", "iac", "llm", "etl", "ror", "drf", "rtk", "amqp", "a11y"}


def _norm(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


@dataclass
class Skill:
    name: str
    category: str
    aliases: list[str] = field(default_factory=list)
    related: list[str] = field(default_factory=list)


class SkillTaxonomy:
    def __init__(self, skills: list[Skill]):
        self.skills: dict[str, Skill] = {}
        self._lookup: dict[str, str] = {}
        for skill in skills:
            self.add(skill)
        self._patterns: list[tuple[re.Pattern[str], str]] | None = None

    @classmethod
    def from_file(cls, path: Path = DATA_FILE) -> "SkillTaxonomy":
        raw = json.loads(path.read_text(encoding="utf-8"))
        return cls([Skill(**item) for item in raw])

    def add(self, skill: Skill) -> None:
        key = _norm(skill.name)
        existing = self.skills.get(key)
        if existing:
            existing.aliases = sorted(set(existing.aliases) | set(skill.aliases))
            existing.related = sorted(set(existing.related) | set(skill.related))
        else:
            self.skills[key] = skill
        self._lookup[key] = self.skills[key].name
        for alias in skill.aliases:
            self._lookup.setdefault(_norm(alias), self.skills[key].name)
        self._patterns = None

    def with_custom(self, custom: list[dict] | None) -> "SkillTaxonomy":
        if not custom:
            return self
        clone = SkillTaxonomy([Skill(s.name, s.category, list(s.aliases), list(s.related)) for s in self.skills.values()])
        for item in custom:
            name = str(item.get("name", "")).strip()[:80]
            if not name:
                continue
            clone.add(Skill(
                name=name,
                category=str(item.get("category") or "Other")[:60],
                aliases=[str(a)[:80] for a in item.get("aliases", [])][:20],
                related=[str(r)[:80] for r in item.get("related", [])][:20],
            ))
        return clone

    # --- lookups -----------------------------------------------------------------
    def canonical(self, value: str) -> str | None:
        key = _norm(value)
        if key in self._lookup:
            return self._lookup[key]
        # tolerate trailing punctuation / version numbers like "React 18"
        stripped = re.sub(r"[\s.]*v?\d+(\.\d+)*$", "", key).strip(" .,:;")
        return self._lookup.get(stripped)

    def is_alias(self, value: str) -> bool:
        key = _norm(value)
        canon = self.canonical(value)
        return canon is not None and _norm(canon) != key

    def category(self, name: str) -> str:
        skill = self.skills.get(_norm(name))
        return skill.category if skill else "Other"

    def related(self, name: str) -> set[str]:
        skill = self.skills.get(_norm(name))
        if not skill:
            return set()
        out = {self.canonical(r) or r for r in skill.related}
        # relations are symmetric
        for other in self.skills.values():
            if skill.name in other.related:
                out.add(other.name)
        out.discard(skill.name)
        return out

    def are_related(self, a: str, b: str) -> bool:
        return b in self.related(a) or a in self.related(b)

    # --- extraction --------------------------------------------------------------
    def _compiled(self) -> list[tuple[re.Pattern[str], str]]:
        if self._patterns is None:
            patterns = []
            for term, canonical in self._lookup.items():
                if term in AMBIGUOUS or len(term) < 2:
                    continue
                pattern = re.compile(r"(?<![A-Za-z0-9])" + re.escape(term) + r"(?![A-Za-z0-9+#])", re.IGNORECASE)
                patterns.append((pattern, canonical))
            # longer terms first so "react native" wins over "react"
            patterns.sort(key=lambda p: -len(p[0].pattern))
            self._patterns = patterns
        return self._patterns

    def extract(self, text: str, skill_list_items: list[str] | None = None) -> dict[str, int]:
        """Return canonical skill -> mention count."""
        found: dict[str, int] = {}
        consumed = text
        for pattern, canonical in self._compiled():
            matches = pattern.findall(consumed)
            if matches:
                found[canonical] = found.get(canonical, 0) + len(matches)
                consumed = pattern.sub(" ", consumed)
        for item in skill_list_items or []:
            canonical = self.canonical(item)
            if canonical:
                found[canonical] = max(found.get(canonical, 0), 1)
        return found

    def unknown_items(self, items: list[str]) -> list[str]:
        out = []
        for item in items:
            clean = item.strip(" .;:-•*")
            if 1 < len(clean) <= 40 and not self.canonical(clean) and len(clean.split()) <= 4:
                out.append(clean)
        return sorted(set(out))[:30]


@lru_cache
def get_taxonomy() -> SkillTaxonomy:
    return SkillTaxonomy.from_file()
