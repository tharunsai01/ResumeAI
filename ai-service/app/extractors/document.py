"""Safe text extraction from PDF and DOCX files.

Files are treated as hostile: magic bytes are checked, page and character
counts are capped, and text that a human reader would not see (tiny or
white-on-white text) is reported so the injection scanner can flag it.
"""

from __future__ import annotations

import io
import unicodedata
import zipfile
from dataclasses import dataclass, field

import pymupdf
from docx import Document

from app.core.config import get_settings


class DocumentError(ValueError):
    """Raised for files that cannot be processed safely."""


@dataclass
class ExtractedDocument:
    text: str
    file_type: str
    pages: int
    hidden_text: list[str] = field(default_factory=list)
    truncated: bool = False


def detect_file_type(data: bytes) -> str:
    if data[:5] == b"%PDF-":
        return "pdf"
    if data[:4] == b"PK\x03\x04":
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                names = set(archive.namelist())
                if "word/document.xml" not in names:
                    raise DocumentError("ZIP archive is not a Word document")
                # zip-bomb guard: refuse archives that inflate absurdly
                total = sum(info.file_size for info in archive.infolist())
                if total > 50 * 1024 * 1024:
                    raise DocumentError("DOCX expands to an unsafe size")
        except zipfile.BadZipFile as exc:
            raise DocumentError("Corrupted DOCX file") from exc
        return "docx"
    raise DocumentError("Unsupported file type. Only PDF and DOCX are accepted")


def clean_text(text: str) -> str:
    # strip zero-width / bidi control characters often used to hide instructions
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Cf")
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace(" ", " ")
    lines = [" ".join(line.split()) for line in text.split("\n")]
    out: list[str] = []
    for line in lines:
        if line or (out and out[-1]):
            out.append(line)
    return "\n".join(out).strip()


def _is_whiteish(color: int) -> bool:
    r, g, b = (color >> 16) & 255, (color >> 8) & 255, color & 255
    return min(r, g, b) >= 245


def _extract_pdf(data: bytes, max_pages: int) -> ExtractedDocument:
    try:
        doc = pymupdf.open(stream=data, filetype="pdf")
    except Exception as exc:  # pymupdf raises several internal types
        raise DocumentError("Malformed PDF file") from exc
    with doc:
        if doc.needs_pass:
            raise DocumentError("Password-protected PDFs are not supported")
        if doc.page_count == 0:
            raise DocumentError("PDF has no pages")
        parts: list[str] = []
        hidden: list[str] = []
        for index, page in enumerate(doc):
            if index >= max_pages:
                break
            page_lines: list[str] = []
            for block in page.get_text("dict").get("blocks", []):
                for line in block.get("lines", []):
                    line_text = []
                    for span in line.get("spans", []):
                        content = span.get("text", "")
                        if not content.strip():
                            continue
                        if span.get("size", 12) < 3 or _is_whiteish(int(span.get("color", 0))):
                            hidden.append(content.strip())
                        line_text.append(content)
                    if line_text:
                        page_lines.append("".join(line_text))
            parts.append("\n".join(page_lines))
        return ExtractedDocument(text="\n".join(parts), file_type="pdf", pages=doc.page_count, hidden_text=hidden)


def _extract_docx(data: bytes) -> ExtractedDocument:
    try:
        document = Document(io.BytesIO(data))
    except Exception as exc:
        raise DocumentError("Malformed DOCX file") from exc
    parts: list[str] = []
    hidden: list[str] = []

    def visit_paragraph(paragraph) -> None:
        parts.append(paragraph.text)
        for run in paragraph.runs:
            font = run.font
            tiny = font.size is not None and font.size.pt < 3
            white = font.color is not None and font.color.type is not None and font.color.rgb is not None \
                and str(font.color.rgb).upper() in {"FFFFFF", "FEFEFE", "FDFDFD"}
            if run.text.strip() and (font.hidden or tiny or white):
                hidden.append(run.text.strip())

    for paragraph in document.paragraphs:
        visit_paragraph(paragraph)
    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    visit_paragraph(paragraph)
    return ExtractedDocument(text="\n".join(parts), file_type="docx", pages=1, hidden_text=hidden)


def extract_document(data: bytes, declared_name: str | None = None) -> ExtractedDocument:
    settings = get_settings()
    if not data:
        raise DocumentError("Empty file")
    if len(data) > settings.max_file_mb * 1024 * 1024:
        raise DocumentError(f"File exceeds {settings.max_file_mb} MB limit")
    file_type = detect_file_type(data)
    if declared_name:
        ext = declared_name.lower().rsplit(".", 1)[-1] if "." in declared_name else ""
        if ext and ext != file_type:
            raise DocumentError("File extension does not match file contents")
    result = _extract_pdf(data, settings.max_pdf_pages) if file_type == "pdf" else _extract_docx(data)
    result.text = clean_text(result.text)
    if len(result.text) > settings.max_text_chars:
        result.text = result.text[: settings.max_text_chars]
        result.truncated = True
    if len(result.text) < 30:
        raise DocumentError("Could not find readable text. Scanned image-only resumes are not supported")
    return result
