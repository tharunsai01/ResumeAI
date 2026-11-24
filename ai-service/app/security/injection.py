"""Prompt-injection and manipulation detection for untrusted documents.

Resume and job text is data. Nothing in it may change system instructions,
the scoring formula, or security policy. This module scores how likely a
document is to contain such an attempt so a human can review it.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

PATTERNS: list[tuple[str, str, int]] = [
    # (finding type, regex, severity 1-5)
    ("instruction_override", r"\b(ignore|disregard|forget|override)\b[^.\n]{0,40}\b(previous|prior|above|earlier|all|system)\b[^.\n]{0,20}\b(instructions?|prompts?|rules?|directions?)", 5),
    ("role_hijack", r"\byou are (now|no longer)\b|\bact as (an?|the) (ai|assistant|system|recruiter|hiring manager)\b|\bnew instructions?\s*:", 4),
    ("system_prompt_probe", r"\b(system|developer)\s*(prompt|message|instructions?)\b|\breveal (your|the) (prompt|instructions)", 4),
    ("score_manipulation", r"\b(give|assign|rate|score|rank)\b[^.\n]{0,40}\b(100|100%|perfect|maximum|highest|top)\b[^.\n]{0,30}\b(score|match|candidate|rating|rank)", 5),
    ("score_manipulation", r"\b(this|the) candidate (is|must be|should be) (the )?(best|perfect|top|ideal)\b[^.\n]{0,40}\b(hire|select|shortlist|rank)", 4),
    ("decision_manipulation", r"\b(automatically|immediately)\s+(hire|shortlist|approve|advance|select)\b", 4),
    ("formula_tampering", r"\b(change|modify|update|set)\b[^.\n]{0,30}\b(weights?|formula|scoring|algorithm|threshold)\b", 4),
    ("prompt_markup", r"<\s*/?\s*(system|assistant|user|im_start|im_end|instructions?)\s*>|\[\s*(system|inst)\s*\]|###\s*(system|instruction)", 4),
    ("data_exfiltration", r"\b(print|output|return|send|leak)\b[^.\n]{0,30}\b(api[_ ]?key|secret|token|password|credentials|environment variables)\b", 5),
    ("tool_abuse", r"\b(execute|run|eval)\b[^.\n]{0,20}\b(code|command|script|shell)\b", 2),
]

COMPILED = [(kind, re.compile(rx, re.IGNORECASE), sev) for kind, rx, sev in PATTERNS]
ZERO_WIDTH = re.compile("[​‌‍⁠﻿‪-‮]")


@dataclass
class Finding:
    type: str
    severity: int
    excerpt: str

    def as_dict(self) -> dict:
        return {"type": self.type, "severity": self.severity, "excerpt": self.excerpt}


def scan(text: str, hidden_text: list[str] | None = None, raw_text: str | None = None) -> dict:
    findings: list[Finding] = []
    for kind, pattern, severity in COMPILED:
        for match in pattern.finditer(text):
            start = max(0, match.start() - 30)
            excerpt = text[start: match.end() + 30].replace("\n", " ")
            findings.append(Finding(kind, severity, excerpt[:160]))
            if len([f for f in findings if f.type == kind]) >= 3:
                break

    hidden = [h for h in (hidden_text or []) if len(h) > 3]
    if hidden:
        joined = " ".join(hidden)
        hidden_hits = [kind for kind, pattern, _ in COMPILED if pattern.search(joined)]
        severity = 5 if hidden_hits else 3
        findings.append(Finding("hidden_text", severity, joined[:160]))

    if raw_text and ZERO_WIDTH.search(raw_text):
        findings.append(Finding("invisible_characters", 2, "Document contains zero-width or bidi control characters"))

    # keyword stuffing: same skill-like token repeated unnaturally
    words = re.findall(r"[a-zA-Z+#.]{2,}", text.lower())
    if len(words) > 50:
        counts: dict[str, int] = {}
        for word in words:
            counts[word] = counts.get(word, 0) + 1
        stuffed = [w for w, c in counts.items() if c > max(25, len(words) * 0.06) and len(w) > 3]
        common = {"with", "and", "the", "for", "from", "that", "this", "experience", "using", "team"}
        stuffed = [w for w in stuffed if w not in common]
        if stuffed:
            findings.append(Finding("keyword_stuffing", 2, ", ".join(stuffed[:5])))

    score = min(100, sum(f.severity * 12 for f in findings))
    level = "high" if score >= 50 else "medium" if score >= 20 else "low" if score > 0 else "none"
    return {
        "risk_score": score,
        "risk_level": level,
        "flagged": score >= 40,
        "findings": [f.as_dict() for f in findings],
    }


def neutralize(text: str) -> str:
    """Strip markup that could be mistaken for prompt structure before sending text to an LLM."""
    text = ZERO_WIDTH.sub("", text)
    text = re.sub(r"<\s*/?\s*(system|assistant|user|im_start|im_end)[^>]*>", "[removed-tag]", text, flags=re.IGNORECASE)
    text = text.replace("```", "'''")
    return text
