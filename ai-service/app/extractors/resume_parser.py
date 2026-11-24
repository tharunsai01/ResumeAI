"""Deterministic resume parser. Always available, also used to validate LLM output."""

from __future__ import annotations

import re
from datetime import date

from app.services.taxonomy import SkillTaxonomy

SECTION_ALIASES = {
    "summary": ["summary", "profile", "professional summary", "objective", "about me", "about", "career objective", "career summary"],
    "experience": ["experience", "work experience", "professional experience", "employment", "employment history", "work history", "career history", "internships", "internship"],
    "education": ["education", "academic background", "academics", "education and training", "qualifications"],
    "skills": ["skills", "technical skills", "core competencies", "key skills", "technologies", "tech stack", "skills and tools", "tools"],
    "projects": ["projects", "personal projects", "key projects", "academic projects"],
    "certifications": ["certifications", "certificates", "licenses", "licenses and certifications", "courses"],
    "achievements": ["achievements", "awards", "honors", "accomplishments"],
    "other": ["languages", "interests", "hobbies", "references", "volunteering", "publications"],
}
HEADING_LOOKUP = {alias: section for section, aliases in SECTION_ALIASES.items() for alias in aliases}

MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], start=1)}
MONTH_RX = r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
DATE_RX = rf"(?:{MONTH_RX}\.?\s*,?\s*\d{{4}}|\d{{1,2}}/\d{{4}}|\d{{4}})"
RANGE_RX = re.compile(rf"(?P<start>{DATE_RX})\s*(?:-|–|—|to|until)\s*(?P<end>{DATE_RX}|present|current|now|today|ongoing)", re.IGNORECASE)
YEARS_STATEMENT = re.compile(r"(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:professional\s+|industry\s+|work\s+|hands-on\s+)?experience", re.IGNORECASE)
EMAIL_RX = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RX = re.compile(r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}")
URL_RX = re.compile(r"(?:https?://)?(?:www\.)?(linkedin\.com/in/[\w-]+|github\.com/[\w-]+)[/\w-]*", re.IGNORECASE)

DEGREES = [
    (5, "Doctorate", r"\b(ph\.?\s?d|doctorate|doctor of philosophy|d\.phil)\b"),
    (4, "Master's", r"\b(master'?s?|m\.?\s?s\.?c?|m\.?\s?tech|m\.?\s?e\b|mba|m\.?\s?a\b|mca|m\.?eng|ms in|ms,)\b"),
    (3, "Bachelor's", r"\b(bachelor'?s?|b\.?\s?s\.?c?|b\.?\s?tech|b\.?\s?e\b|bca|b\.?\s?a\b|b\.?eng|bs in|bs,|undergraduate degree)\b"),
    (2, "Associate/Diploma", r"\b(associate'?s? degree|diploma|polytechnic)\b"),
    (1, "High School", r"\b(high school|secondary school|hsc|ssc|12th|a-levels?)\b"),
]
INSTITUTION_RX = re.compile(r"\b(university|college|institute|school|academy|iit|nit|polytechnic)\b", re.IGNORECASE)


def _heading(line: str) -> str | None:
    clean = line.strip().strip(":").strip().lower()
    clean = re.sub(r"[^a-z &]", "", clean).strip()
    if not clean or len(clean) > 40:
        return None
    return HEADING_LOOKUP.get(clean)


def split_sections(text: str) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"header": []}
    current = "header"
    for line in text.split("\n"):
        heading = _heading(line)
        if heading:
            current = heading
            sections.setdefault(current, [])
            continue
        if line.strip():
            sections.setdefault(current, []).append(line.strip())
    return sections


def _parse_date(value: str, is_end: bool) -> tuple[int, int] | None:
    value = value.strip().lower().rstrip(".")
    today = date.today()
    if value in {"present", "current", "now", "today", "ongoing"}:
        return today.year, today.month
    m = re.match(r"(\d{1,2})/(\d{4})", value)
    if m:
        return int(m.group(2)), max(1, min(12, int(m.group(1))))
    m = re.match(rf"({MONTH_RX})\.?\s*,?\s*(\d{{4}})", value)
    if m:
        return int(m.group(2)), MONTHS[m.group(1)[:3]]
    m = re.match(r"(\d{4})", value)
    if m:
        return int(m.group(1)), 12 if is_end else 1
    return None


def date_ranges(lines: list[str]) -> list[tuple[int, int, str, int]]:
    """Return (start_index, end_index, line, line_no) as month counters."""
    out = []
    today = date.today()
    now_index = today.year * 12 + today.month
    for line_no, line in enumerate(lines):
        for match in RANGE_RX.finditer(line):
            start = _parse_date(match.group("start"), False)
            end = _parse_date(match.group("end"), True)
            if not start or not end:
                continue
            s, e = start[0] * 12 + start[1], min(end[0] * 12 + end[1], now_index)
            if 1950 * 12 < s <= e:
                out.append((s, e, line, line_no))
    return out


def total_experience_years(ranges: list[tuple[int, int, str, int]]) -> float:
    intervals = sorted((s, e) for s, e, _, _ in ranges)
    merged: list[list[int]] = []
    for s, e in intervals:
        if merged and s <= merged[-1][1] + 1:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    months = sum(e - s + 1 for s, e in merged)
    return round(months / 12, 1)


def _split_title_company(text: str) -> tuple[str, str]:
    text = RANGE_RX.sub("", text).strip(" |,-–—()")
    for sep in [" at ", " @ ", " | ", " – ", " — ", " - ", ", "]:
        if sep in text:
            left, right = text.split(sep, 1)
            return left.strip(" |,-"), right.strip(" |,-")
    return text, ""


def parse_experience(lines: list[str]) -> list[dict]:
    entries = []
    for s, e, line, line_no in date_ranges(lines):
        title, company = _split_title_company(line)
        if not title and line_no > 0:
            title, company = _split_title_company(lines[line_no - 1])
        elif not company and line_no > 0 and not RANGE_RX.search(lines[line_no - 1]):
            prev = lines[line_no - 1]
            if len(prev) < 80:
                company, title = (title, prev) if len(title) < 50 else (prev, title)
        description = []
        for follow in lines[line_no + 1: line_no + 6]:
            if RANGE_RX.search(follow):
                break
            description.append(follow.lstrip("•*-– "))
        entries.append({
            "title": title[:120],
            "company": company[:120],
            "start": f"{s // 12 if s % 12 else s // 12 - 1}-{(s % 12 or 12):02d}",
            "end": f"{e // 12 if e % 12 else e // 12 - 1}-{(e % 12 or 12):02d}",
            "months": e - s + 1,
            "description": " ".join(description)[:600],
        })
    return entries


def degree_level(text: str) -> tuple[int, str]:
    lowered = text.lower()
    for level, label, rx in DEGREES:
        if re.search(rx, lowered):
            return level, label
    return 0, "Not specified"


def parse_education(lines: list[str]) -> list[dict]:
    entries: list[dict] = []
    for idx, line in enumerate(lines):
        level, label = degree_level(line)
        if not level:
            continue
        field = ""
        m = re.search(r"\b(?:in|of)\s+([A-Za-z &]+?)(?:,|\(|\||-|–|$|\d)", line)
        if m:
            field = m.group(1).strip()
        institution = ""
        for candidate in [line] + lines[idx + 1: idx + 3] + lines[max(0, idx - 1): idx]:
            if INSTITUTION_RX.search(candidate):
                institution = candidate if candidate != line else ""
                if candidate == line:
                    parts = re.split(r",|\||–|-", line)
                    institution = next((p.strip() for p in parts if INSTITUTION_RX.search(p)), "")
                break
        year = re.findall(r"\b(19[5-9]\d|20\d{2})\b", line + " " + " ".join(lines[idx + 1: idx + 2]))
        entries.append({"degree": line[:140], "level": level, "level_label": label, "field": field[:80],
                        "institution": institution[:140], "year": int(year[-1]) if year else None})
    return entries


def _skill_list_items(lines: list[str]) -> list[str]:
    items: list[str] = []
    for line in lines:
        line = re.sub(r"^[A-Za-z &/]{2,30}:\s*", "", line)  # "Languages: Python, Go"
        items.extend(p.strip() for p in re.split(r"[,;|•·/]|\s{2,}|\band\b", line) if p.strip())
    return items


def parse_resume(text: str, taxonomy: SkillTaxonomy) -> dict:
    sections = split_sections(text)
    header = sections.get("header", [])
    all_lines = [ln for ln in text.split("\n") if ln.strip()]

    name = ""
    for line in header[:5]:
        if EMAIL_RX.search(line) or any(ch.isdigit() for ch in line):
            continue
        words = line.split()
        if 1 < len(words) <= 4 and all(re.match(r"^[A-Za-z.'-]+$", w) for w in words):
            name = line.strip()
            break

    headline = ""
    for line in header[:6]:
        if line != name and not EMAIL_RX.search(line) and not PHONE_RX.search(line) and 3 < len(line) < 90:
            headline = line
            break

    exp_lines = sections.get("experience") or all_lines
    experience = parse_experience(exp_lines)
    years = total_experience_years(date_ranges(exp_lines))
    stated = [float(m) for m in YEARS_STATEMENT.findall(text)]
    if stated and (years == 0 or max(stated) > years and not sections.get("experience")):
        years = max(years, max(stated))
    years = min(years, 50.0)

    edu_lines = sections.get("education") or all_lines
    education = parse_education(edu_lines)
    highest = max(education, key=lambda e: e["level"]) if education else None

    skill_items = _skill_list_items(sections.get("skills", []))
    counts = taxonomy.extract(text, skill_items)
    skills = [{"name": n, "category": taxonomy.category(n), "mentions": c}
              for n, c in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))]

    summary = " ".join(sections.get("summary", []))[:1200]
    if not summary:
        summary = " ".join(header[2:5])[:600]

    contact = {
        "email": (EMAIL_RX.search(text).group(0) if EMAIL_RX.search(text) else ""),
        "phone": "",
        "links": sorted({m.group(1).lower() for m in URL_RX.finditer(text)}),
    }
    for line in header[:8]:
        phone = PHONE_RX.search(line)
        if phone and len(re.sub(r"\D", "", phone.group(0))) >= 9:
            contact["phone"] = phone.group(0).strip()
            break

    titles = [e["title"] for e in experience if e["title"]]
    if headline and not titles:
        titles = [headline]

    return {
        "name": name,
        "headline": headline,
        "contact": contact,
        "summary": summary,
        "skills": skills,
        "unknown_skills": taxonomy.unknown_items(skill_items),
        "experience": experience,
        "total_experience_years": years,
        "job_titles": titles[:10],
        "education": education,
        "highest_education_level": highest["level"] if highest else 0,
        "highest_education_label": highest["level_label"] if highest else "Not specified",
        "certifications": [ln.lstrip("•*- ")[:140] for ln in sections.get("certifications", [])][:15],
        "projects": [ln.lstrip("•*- ")[:200] for ln in sections.get("projects", [])][:10],
        "sections_found": sorted(k for k in sections if k != "header"),
    }
