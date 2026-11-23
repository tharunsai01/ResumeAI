import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"

export default function PrivacyPage() {
  return (
    <DashboardShell type="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Privacy Policy</h1>
          <p className="text-brand-navy/60 mt-2">How we protect and manage your data.</p>
        </div>
        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle>Data Privacy</PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4 text-brand-navy/70">
            <p>Your resume and profile data are processed locally in this demo environment. In a production environment, HireSmart AI adheres to strict data protection standards.</p>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </DashboardShell>
  )
}
