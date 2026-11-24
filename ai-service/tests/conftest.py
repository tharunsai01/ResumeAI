import io
import os

os.environ["INTERNAL_SERVICE_TOKEN"] = "test-internal-token"
os.environ["EMBEDDINGS_ENABLED"] = "false"  # deterministic TF-IDF in unit tests
os.environ["GROQ_API_KEY"] = ""

import pymupdf  # noqa: E402
import pytest  # noqa: E402
from docx import Document  # noqa: E402
from docx.shared import Pt, RGBColor  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

RESUME_TEXT = """Jordan Rivera
Senior Full-Stack Engineer
jordan.rivera@example.com | +1 415 555 0134 | linkedin.com/in/jordanrivera

Summary
Full-stack engineer with 6 years of experience building SaaS products with React, Node.js and MongoDB.

Experience
Senior Software Engineer at Northwind Labs | Jan 2021 - Present
Led a team building a React and TypeScript dashboard backed by Express and MongoDB.
Software Engineer at Contoso Ltd | Jun 2018 - Dec 2020
Built REST APIs in Node.js and deployed services with Docker on AWS.

Education
B.Tech in Computer Science, Indian Institute of Technology, 2018

Skills
JavaScript, TypeScript, ReactJS, Node.js, Express, MongoDB, Docker, AWS, Git, Jest, GraphQL

Certifications
AWS Certified Developer - Associate
"""


@pytest.fixture
def client():
    from app.main import app

    return TestClient(app, headers={"X-Internal-Token": "test-internal-token"})


@pytest.fixture
def resume_text():
    return RESUME_TEXT


def make_pdf(text: str, hidden: str | None = None) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    y = 50
    for line in text.split("\n"):
        page.insert_text((50, y), line, fontsize=10)
        y += 13
    if hidden:
        page.insert_text((50, y + 10), hidden, fontsize=1, color=(1, 1, 1))
    data = doc.tobytes()
    doc.close()
    return data


def make_docx(text: str, hidden: str | None = None) -> bytes:
    document = Document()
    for line in text.split("\n"):
        document.add_paragraph(line)
    if hidden:
        run = document.add_paragraph().add_run(hidden)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(1)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


@pytest.fixture
def pdf_bytes():
    return make_pdf(RESUME_TEXT)


@pytest.fixture
def docx_bytes():
    return make_docx(RESUME_TEXT)
