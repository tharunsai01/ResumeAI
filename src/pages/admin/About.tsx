import { AdminShell } from "../../components/layout/AdminShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { Info } from "lucide-react"

export default function AdminAbout() {
  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">About HireSmart AI</h1>
        </div>
        
        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-indigo" />
              Platform Information
            </PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4 text-brand-navy/70">
            <p>HireSmart AI is a next-generation recruitment platform providing decision support tools for hiring teams.</p>
            <p>Version: 1.0.0 (Admin Preview)</p>
            <p>Status: All systems operational.</p>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </AdminShell>
  )
}
