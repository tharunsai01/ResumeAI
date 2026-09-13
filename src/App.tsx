import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Landing from "./pages/Landing"
import CandidateDashboard from "./pages/candidate/Dashboard"
import CandidateResume from "./pages/candidate/Resume"
import CandidateResumeAnalysis from "./pages/candidate/ResumeAnalysis"
import CandidateJobs from "./pages/candidate/Jobs"
import CandidateJobDetails from "./pages/candidate/JobDetails"
import CandidateRecommended from "./pages/candidate/Recommended"
import CandidateApplications from "./pages/candidate/Applications"
import CandidateApplicationDetails from "./pages/candidate/ApplicationDetails"
import CandidateSkills from "./pages/candidate/Skills"
import CandidateProfile from "./pages/candidate/Profile"
import CandidateProfilePreview from "./pages/candidate/ProfilePreview"
import CandidateSettings from "./pages/candidate/Settings"
import CandidateHelp from "./pages/candidate/Help"
import CandidateComplaint from "./pages/candidate/Complaint"
import CandidateSafety from "./pages/candidate/Safety"
import CandidateTerms from "./pages/candidate/Terms"
import CandidatePrivacy from "./pages/candidate/Privacy"
import CandidateAbout from "./pages/candidate/About"

import RecruiterDashboard from "./pages/recruiter/Dashboard"
import RecruiterJobs from "./pages/recruiter/Jobs"
import RecruiterCreateJob from "./pages/recruiter/CreateJob"
import RecruiterJobDetails from "./pages/recruiter/JobDetails"
import RecruiterCandidates from "./pages/recruiter/Candidates"
import RecruiterCandidateProfile from "./pages/recruiter/CandidateProfile"
import RecruiterScreening from "./pages/recruiter/Screening"
import RecruiterShortlist from "./pages/recruiter/Shortlist"
import RecruiterInterviews from "./pages/recruiter/Interviews"
import RecruiterAnalytics from "./pages/recruiter/Analytics"

import { AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { settingsService } from "./services/settingsService"

import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

function App() {
  useEffect(() => {
    const settings = settingsService.getSettings()
    settingsService.applyTheme(settings.appearance.theme)
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            
            {/* Candidate Routes */}
            <Route element={<ProtectedRoute allowedRole="candidate" />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/resume" element={<CandidateResume />} />
              <Route path="/candidate/resume/analysis" element={<CandidateResumeAnalysis />} />
              <Route path="/candidate/jobs" element={<CandidateJobs />} />
              <Route path="/candidate/jobs/:jobId" element={<CandidateJobDetails />} />
              <Route path="/candidate/recommended" element={<CandidateRecommended />} />
              <Route path="/candidate/applications" element={<CandidateApplications />} />
              <Route path="/candidate/applications/:applicationId" element={<CandidateApplicationDetails />} />
              <Route path="/candidate/skills" element={<CandidateSkills />} />
              <Route path="/candidate/profile" element={<CandidateProfile />} />
              <Route path="/candidate/profile/preview" element={<CandidateProfilePreview />} />
              <Route path="/candidate/settings" element={<CandidateSettings />} />
              <Route path="/candidate/help" element={<CandidateHelp />} />
              <Route path="/candidate/complaint" element={<CandidateComplaint />} />
              <Route path="/candidate/safety" element={<CandidateSafety />} />
              <Route path="/candidate/terms" element={<CandidateTerms />} />
              <Route path="/candidate/privacy" element={<CandidatePrivacy />} />
              <Route path="/candidate/about" element={<CandidateAbout />} />
            </Route>
            
            {/* Recruiter Routes */}
            <Route element={<ProtectedRoute allowedRole="recruiter" />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/jobs/create" element={<RecruiterCreateJob />} />
              <Route path="/recruiter/jobs/:jobId" element={<RecruiterJobDetails />} />
              <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
              <Route path="/recruiter/candidates/:candidateId" element={<RecruiterCandidateProfile />} />
              <Route path="/recruiter/screening" element={<RecruiterScreening />} />
              <Route path="/recruiter/shortlist" element={<RecruiterShortlist />} />
              <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
              <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
              <Route path="/recruiter/settings" element={<CandidateSettings type="recruiter" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
