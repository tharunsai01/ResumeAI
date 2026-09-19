import { DashboardShell } from "../../components/layout/DashboardShell"

export default function RecruiterProfile() {
  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Recruiter Profile</h1>
        <p className="text-brand-navy/60">Recruiter profile management.</p>
      </div>
    </DashboardShell>
  )
}
