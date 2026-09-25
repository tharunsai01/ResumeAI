import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"

export default function AboutPage() {
  return (
    <DashboardShell type="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">About HireSmart AI</h1>
          <p className="text-brand-navy/60 mt-2">Learn about our mission and technology.</p>
        </div>
        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle>Our Mission</PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4 text-brand-navy/70">
            <p>HireSmart AI is an AI-Based Resume Screening & Job Matching System designed to bridge the gap between talented candidates and the right opportunities through intelligent analysis.</p>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </DashboardShell>
  )
}
