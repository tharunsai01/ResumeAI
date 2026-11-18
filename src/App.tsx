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
import RecruiterEditJob from "./pages/recruiter/EditJob"
import RecruiterJobDetails from "./pages/recruiter/JobDetails"
import RecruiterCandidates from "./pages/recruiter/Candidates"
import RecruiterCandidateProfile from "./pages/recruiter/CandidateProfile"
import RecruiterScreening from "./pages/recruiter/Screening"
import RecruiterJobScreening from "./pages/recruiter/JobScreening"
import RecruiterCandidateScreening from "./pages/recruiter/CandidateScreening"
import RecruiterShortlist from "./pages/recruiter/Shortlist"
import RecruiterInterviews from "./pages/recruiter/Interviews"
import RecruiterInterviewDetails from "./pages/recruiter/InterviewDetails"
import RecruiterHiringPipeline from "./pages/recruiter/HiringPipeline"
import RecruiterAnalytics from "./pages/recruiter/Analytics"
import RecruiterProfile from "./pages/recruiter/Profile"
import RecruiterSettings from "./pages/recruiter/Settings"
import RecruiterHelp from "./pages/recruiter/Help"
import RecruiterComplaint from "./pages/recruiter/Complaint"
import RecruiterSafety from "./pages/recruiter/Safety"
import RecruiterTerms from "./pages/recruiter/Terms"
import RecruiterPrivacy from "./pages/recruiter/Privacy"
import RecruiterAbout from "./pages/recruiter/About"

import AdminDashboard from "./pages/admin/Dashboard"
import AdminUsers from "./pages/admin/Users"
import UserDetails from "./pages/admin/UserDetails"
import AdminComplaints from "./pages/admin/Complaints"
import AdminComplaintDetails from "./pages/admin/ComplaintDetails"
import AdminSkills from "./pages/admin/Skills"
import AdminAuditLogs from "./pages/admin/AuditLogs"
import AdminAiEvaluation from "./pages/admin/AiEvaluation"
import AdminSystemHealth from "./pages/admin/SystemHealth"
import AdminSettings from "./pages/admin/Settings"
import AdminHelp from "./pages/admin/Help"
import AdminComplaintForm from "./pages/admin/Complaint"
import AdminSafety from "./pages/admin/Safety"
import AdminTerms from "./pages/admin/Terms"
import AdminPrivacy from "./pages/admin/Privacy"
import AdminAbout from "./pages/admin/About"
import { AdminUsersOutlet } from "./contexts/AdminUsersContext"
import { AdminComplaintsOutlet } from "./contexts/AdminComplaintsContext"
import { AdminSkillsOutlet } from "./contexts/AdminSkillsContext"
import { AdminAuditLogsOutlet } from "./contexts/AdminAuditLogsContext"
import { AdminAiEvaluationOutlet } from "./contexts/AdminAiEvaluationContext"
import { AdminSystemHealthOutlet } from "./contexts/AdminSystemHealthContext"
import { AdminSettingsOutlet } from "./contexts/AdminSettingsContext"
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
              <Route path="/recruiter/jobs/:jobId/edit" element={<RecruiterEditJob />} />
              <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
              <Route path="/recruiter/candidates/:candidateId" element={<RecruiterCandidateProfile />} />
              <Route path="/recruiter/screening" element={<RecruiterScreening />} />
              <Route path="/recruiter/screening/:jobId" element={<RecruiterJobScreening />} />
              <Route path="/recruiter/screening/:jobId/:candidateId" element={<RecruiterCandidateScreening />} />
              <Route path="/recruiter/shortlist" element={<RecruiterShortlist />} />
              <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
              <Route path="/recruiter/interviews/:interviewId" element={<RecruiterInterviewDetails />} />
              <Route path="/recruiter/hiring" element={<RecruiterHiringPipeline />} />
              <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
              <Route path="/recruiter/profile" element={<RecruiterProfile />} />
              <Route path="/recruiter/settings" element={<RecruiterSettings />} />
              <Route path="/recruiter/help" element={<RecruiterHelp />} />
              <Route path="/recruiter/complaint" element={<RecruiterComplaint />} />
              <Route path="/recruiter/safety" element={<RecruiterSafety />} />
              <Route path="/recruiter/terms" element={<RecruiterTerms />} />
              <Route path="/recruiter/privacy" element={<RecruiterPrivacy />} />
              <Route path="/recruiter/about" element={<RecruiterAbout />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route element={<AdminUsersOutlet />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:userId" element={<UserDetails />} />
                
                <Route element={<AdminComplaintsOutlet />}>
                  <Route path="/admin/complaints" element={<AdminComplaints />} />
                  <Route path="/admin/complaints/:complaintId" element={<AdminComplaintDetails />} />
                </Route>
                
                <Route element={<AdminSkillsOutlet />}>
                  <Route path="/admin/skills" element={<AdminSkills />} />
                </Route>

                <Route element={<AdminAuditLogsOutlet />}>
                  <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                </Route>

                <Route element={<AdminAiEvaluationOutlet />}>
                  <Route path="/admin/ai-evaluation" element={<AdminAiEvaluation />} />
                </Route>

                <Route element={<AdminSystemHealthOutlet />}>
                  <Route path="/admin/system-health" element={<AdminSystemHealth />} />
                </Route>

                <Route element={<AdminSettingsOutlet />}>
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>
                
                <Route path="/admin/help" element={<AdminHelp />} />
                <Route path="/admin/complaint" element={<AdminComplaintForm />} />
                <Route path="/admin/safety" element={<AdminSafety />} />
                <Route path="/admin/terms" element={<AdminTerms />} />
                <Route path="/admin/privacy" element={<AdminPrivacy />} />
                <Route path="/admin/about" element={<AdminAbout />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
