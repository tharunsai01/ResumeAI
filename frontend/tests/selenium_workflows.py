"""Exercise HireSmart through Chrome using synthetic data in the CI stack."""

import os
from pathlib import Path
from tempfile import TemporaryDirectory
from time import sleep
import unittest
from urllib.parse import urlsplit
from uuid import uuid4
from zipfile import ZipFile

from selenium import webdriver
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait



def upload_and_verify_resume(driver, wait, step=lambda _: None):
    step("Upload a synthetic DOCX résumé")
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
        step("Run résumé analysis")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Analyze Resume']"))).click()
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='View AI Analysis']"))).click()
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[normalize-space()='Resume Analysis']")))
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[normalize-space()='Resume Score']")))
        step("Verified résumé analysis and score")


class PortalWorkflows(unittest.TestCase):
    def setUp(self):
        self.origin = os.environ["RESUMEAI_BASE_URL"].rstrip("/")
        options = webdriver.ChromeOptions()
        self.watch = os.environ.get("RESUMEAI_SELENIUM_VISIBLE") == "1"
        if not self.watch:
            options.add_argument("--headless")
        options.add_argument("--window-size=1440,1100")
        self.browser = webdriver.Chrome(options=options)
        self.addCleanup(self.browser.quit)
        self.wait = WebDriverWait(self.browser, 30, ignored_exceptions=(StaleElementReferenceException,))

    def step(self, message, seconds=2):
        if self.watch:
            print(f"\n[Selenium] {message}", flush=True)
            sleep(seconds)

    def visit(self, path):
        self.browser.get(self.origin + path)

    def visible(self, selector, by=By.CSS_SELECTOR):
        return self.wait.until(EC.visibility_of_element_located((by, selector)))

    def click(self, selector, by=By.CSS_SELECTOR):
        def click_when_ready(browser):
            element = EC.element_to_be_clickable((by, selector))(browser)
            if not element:
                return False
            element.click()
            return True

        self.wait.until(click_when_ready, message=selector)

    def button(self, text, scope=""):
        self.click(f"//{scope}button[normalize-space()='{text}']", By.XPATH)

    def login(self, role, email, password="Password123!"):
        self.visit("/")
        self.step("HireSmart AI opened in Chrome")
        self.button("Sign In")
        self.button(role)
        self.step(f"Signing in as {role.lower()}")
        self.visible("input[placeholder='Email Address']").send_keys(email)
        self.visible("input[placeholder='Password']").send_keys(password)
        self.button("Sign In", "form//")
        self.wait.until(EC.url_contains(f"/{role.lower()}"))
        self.step(f"Signed in as {role.lower()}")

    def test_session_renews_after_access_token_is_rejected(self):
        self.login("Candidate", "alice@test.com")
        self.browser.execute_script(
            "localStorage.setItem('hiresmart_access_token', 'expired-test-token')"
        )
        self.browser.refresh()
        self.wait.until(lambda driver: driver.execute_script(
            "return localStorage.getItem('hiresmart_access_token')?.split('.').length === 3"
        ))
        self.wait.until(lambda driver: "/candidate/" in driver.current_url)

    def test_candidate_cannot_open_admin_dashboard(self):
        self.login("Candidate", "alice@test.com")
        self.visit("/admin")
        self.wait.until(lambda browser: not browser.current_url.startswith(self.origin + "/admin"))
        self.assertFalse(self.browser.find_elements(By.CSS_SELECTOR, "a[href='/admin/users']"))

    def test_candidate_resume_to_application(self):
        self.login("Candidate", "alice@test.com")
        self.click("My Resume", By.LINK_TEXT)
        upload_and_verify_resume(self.browser, self.wait, self.step)
        self.click("Find Jobs", By.LINK_TEXT)
        title = "Frontend Developer Intern"
        job_card = f"//h3[normalize-space()='{title}']"
        self.visible(job_card, By.XPATH)
        self.step("Find Jobs loaded")
        self.click(job_card, By.XPATH)
        self.visible(f"//h1[normalize-space()='{title}']", By.XPATH)
        job_id = urlsplit(self.browser.current_url).path.rsplit("/", 1)[-1]
        self.step(f"Open {title} and apply")
        self.button("Apply Now")
        self.button("Submit Application")
        self.visible("//h3[contains(normalize-space(), 'Application Submitted')]", By.XPATH)
        self.step("Verified that the application was submitted")
        self.button("View Applications")
        self.visible(f"//*[normalize-space()='{title}']", By.XPATH)
        self.step("Verified the application in My Applications", seconds=5)

        if self.watch:
            return

        self.browser.delete_all_cookies()
        self.browser.execute_script("localStorage.clear(); sessionStorage.clear();")
        self.login("Recruiter", "recruiter@test.com")
        self.visit(f"/recruiter/screening/{job_id}")
        self.visible("//table//*[normalize-space()='Alice Candidate']", By.XPATH)
        self.step("Verified the same applicant in the recruiter portal")

    def test_complaint_reaches_admin_and_resolution_reaches_candidate(self):
        subject = "Selenium complaint workflow"
        self.login("Candidate", "bob@test.com")
        self.visit("/candidate/complaint")
        Select(self.visible("form select")).select_by_visible_text("Technical Problem")
        self.visible("input[placeholder='Briefly describe the issue']").send_keys(subject)
        self.visible("textarea[placeholder^='Please provide details']").send_keys(
            "Synthetic complaint for the automated end-to-end test."
        )
        self.button("Submit Report")
        self.visible("//h2[normalize-space()='Report Submitted']", By.XPATH)

        self.browser.delete_all_cookies()
        self.browser.execute_script("localStorage.clear(); sessionStorage.clear();")
        self.login("Admin", "admin@hiresmart.ai", "admin123")
        self.visit("/admin/complaints")
        row = f"//tr[.//td[normalize-space()='{subject}']]"
        self.visible(row + "[.//*[normalize-space()='Bob Candidate']]", By.XPATH)
        self.click(row + "//button[normalize-space()='View']", By.XPATH)
        self.visible("textarea[placeholder^='Add a response']").send_keys("CI verification complete.")
        Select(self.visible("select[aria-label='Complaint status']")).select_by_visible_text("Resolved")
        self.visible("//*[normalize-space()='CI verification complete.']", By.XPATH)

        self.browser.delete_all_cookies()
        self.browser.execute_script("localStorage.clear(); sessionStorage.clear();")
        self.login("Candidate", "bob@test.com")
        self.visit("/candidate/complaint")
        self.visible(f"//h4[normalize-space()='{subject}']/parent::div[.//*[normalize-space()='Resolved']]", By.XPATH)


if __name__ == "__main__":
    unittest.main(verbosity=2)
