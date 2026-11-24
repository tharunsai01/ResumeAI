import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { DashboardSkeleton } from '@/components/ui';
import { pageTransition } from '@/config/motion';
import { homeFor, useAuth } from '@/context/AuthContext';
import { useDocumentVisibility } from '@/hooks';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import PublicLayout from '@/layouts/PublicLayout';
import type { Role } from '@/types';

// Route-level code splitting
const Landing = lazy(() => import('@/pages/public/Landing'));
const auth = () => import('@/pages/public/AuthPages');
const LoginPage = lazy(() => auth().then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => auth().then((m) => ({ default: m.RegisterPage })));
const OAuthCallbackPage = lazy(() => auth().then((m) => ({ default: m.OAuthCallbackPage })));
const info = () => import('@/pages/public/InfoPages');
const DocsPage = lazy(() => info().then((m) => ({ default: m.DocsPage })));
const ContactPage = lazy(() => info().then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => info().then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => info().then((m) => ({ default: m.TermsPage })));
const NotFoundPage = lazy(() => info().then((m) => ({ default: m.NotFoundPage })));

const cand = () => import('@/pages/candidate');
const CandidateDashboard = lazy(() => cand().then((m) => ({ default: m.CandidateDashboard })));
const CandidateProfilePage = lazy(() => import('@/pages/candidate/Profile'));
const ResumeHub = lazy(() => import('@/pages/candidate/Resumes'));
const JobDiscovery = lazy(() => import('@/pages/candidate/Jobs'));
const MatchPage = lazy(() => cand().then((m) => ({ default: m.MatchPage })));
const MyMatches = lazy(() => cand().then((m) => ({ default: m.MyMatches })));
const SkillAnalysis = lazy(() => cand().then((m) => ({ default: m.SkillAnalysis })));
const MyApplications = lazy(() => cand().then((m) => ({ default: m.MyApplications })));
const SavedJobs = lazy(() => cand().then((m) => ({ default: m.SavedJobs })));

const rec = () => import('@/pages/recruiter');
const RecruiterDashboard = lazy(() => rec().then((m) => ({ default: m.RecruiterDashboard })));
const RecruiterJobs = lazy(() => rec().then((m) => ({ default: m.RecruiterJobs })));
const JobEditor = lazy(() => import('@/pages/recruiter/JobEditor'));
const ScreeningHub = lazy(() => import('@/pages/recruiter/Screening'));
const Pipeline = lazy(() => import('@/pages/recruiter/Pipeline'));
const Interviews = lazy(() => import('@/pages/recruiter/Interviews'));
const TalentPool = lazy(() => rec().then((m) => ({ default: m.TalentPool })));
const CompanyProfile = lazy(() => rec().then((m) => ({ default: m.CompanyProfile })));

const adm = () => import('@/pages/admin');
const AdminOverview = lazy(() => adm().then((m) => ({ default: m.AdminOverview })));
const AdminUsers = lazy(() => adm().then((m) => ({ default: m.AdminUsers })));
const AdminComplaints = lazy(() => adm().then((m) => ({ default: m.AdminComplaints })));
const AdminSkills = lazy(() => adm().then((m) => ({ default: m.AdminSkills })));
const AdminSecurity = lazy(() => adm().then((m) => ({ default: m.AdminSecurity })));
const AdminAudit = lazy(() => adm().then((m) => ({ default: m.AdminAudit })));
const AdminEvaluation = lazy(() => import('@/pages/admin/Evaluation'));
const AdminHealth = lazy(() => adm().then((m) => ({ default: m.AdminHealth })));

const shared = () => import('@/pages/shared');
const NotificationsPage = lazy(() => shared().then((m) => ({ default: m.NotificationsPage })));
const SupportPage = lazy(() => shared().then((m) => ({ default: m.SupportPage })));
const SettingsPage = lazy(() => shared().then((m) => ({ default: m.SettingsPage })));

/** Fades and lifts each route in; keyed by path so the outgoing page fades out first. */
function Transition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} variants={pageTransition} initial="initial" animate="enter" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function PageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>;
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
      <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

function GuestOnly() {
  const { user, status } = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

function Animated() {
  return (
    <PageSuspense>
      <Transition>
        <Outlet />
      </Transition>
    </PageSuspense>
  );
}

export default function App() {
  useDocumentVisibility();
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<Suspense fallback={<FullScreenLoader />}><Outlet /></Suspense>}>
          <Route index element={<Landing />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<Suspense fallback={<FullScreenLoader />}><Outlet /></Suspense>}>
          <Route element={<GuestOnly />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          <Route path="auth/callback" element={<OAuthCallbackPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route element={<Animated />}>
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['candidate']} />}>
        <Route path="candidate" element={<DashboardLayout />}>
          <Route element={<Animated />}>
            <Route index element={<CandidateDashboard />} />
            <Route path="profile" element={<CandidateProfilePage />} />
            <Route path="resumes" element={<ResumeHub />} />
            <Route path="jobs" element={<JobDiscovery />} />
            <Route path="matches" element={<MyMatches />} />
            <Route path="matches/:jobId" element={<MatchPage />} />
            <Route path="skills" element={<SkillAnalysis />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="saved" element={<SavedJobs />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['recruiter']} />}>
        <Route path="recruiter" element={<DashboardLayout />}>
          <Route element={<Animated />}>
            <Route index element={<RecruiterDashboard />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/new" element={<JobEditor />} />
            <Route path="jobs/:id/edit" element={<JobEditor />} />
            <Route path="screening" element={<ScreeningHub />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="talent" element={<TalentPool />} />
            <Route path="company" element={<CompanyProfile />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['admin']} />}>
        <Route path="admin" element={<DashboardLayout />}>
          <Route element={<Animated />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="evaluation" element={<AdminEvaluation />} />
            <Route path="health" element={<AdminHealth />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
