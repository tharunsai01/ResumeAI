"""Exercise the candidate resume flow in Chrome against the seeded local demo."""
import os
import unittest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


from selenium_workflows import upload_and_verify_resume


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

        upload_and_verify_resume(driver, wait)


if __name__ == "__main__":
    unittest.main(verbosity=2)
