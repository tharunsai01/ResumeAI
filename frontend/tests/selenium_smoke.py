"""Exercise the candidate resume flow in Chrome against the seeded local demo."""
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from uuid import uuid4
from zipfile import ZipFile

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class CandidateResumeSmokeTest(unittest.TestCase):
    def test_candidate_can_view_new_resume_analysis(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--window-size=1400,1000")
        driver = webdriver.Chrome(options=options)
        self.addCleanup(driver.quit)
        wait = WebDriverWait(driver, 25)

        base_url = os.environ.get("RESUMEAI_BASE_URL", "http://localhost:5173").rstrip("/")
        driver.get(base_url)
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Sign In']"))).click()
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email Address']"))).send_keys(
            os.environ.get("RESUMEAI_DEMO_EMAIL", "alice@test.com")
        )
        driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password']").send_keys(
            os.environ.get("RESUMEAI_DEMO_PASSWORD", "Password123!")
        )
        driver.find_element(By.XPATH, "//form//button[normalize-space()='Sign In']").click()
        wait.until(EC.url_contains("/candidate/dashboard"))
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "My Resume"))).click()

        with TemporaryDirectory() as temp:
            resume = Path(temp) / "demo-resume.docx"
            with ZipFile(resume, "w") as document:
                document.writestr("[Content_Types].xml",
                    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
                document.writestr("_rels/.rels",
                    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
                    '</Relationships>')
                document.writestr("word/document.xml",
                    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'
                    '<w:p><w:r><w:t>Demo Candidate. Two years of experience building React and TypeScript applications with Node.js and MongoDB.</w:t></w:r></w:p>'
                    f'<w:p><w:r><w:t>Sample reference {uuid4()}</w:t></w:r></w:p></w:body></w:document>')
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type=file]"))).send_keys(str(resume))
            wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Analyze Resume']"))).click()
            wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='View AI Analysis']"))).click()
            self.assertTrue(wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Resume Analysis']"))))
            self.assertTrue(wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[normalize-space()='Resume Score']"))))


if __name__ == "__main__":
    unittest.main(verbosity=2)
