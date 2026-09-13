import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"

export default function TermsPage() {
  return (
    <DashboardShell type="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Terms & Conditions</h1>
          <p className="text-brand-navy/60 mt-2">Legal terms for using HireSmart AI.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>By using HireSmart AI, you agree to abide by our policies and terms of service. This is a mockup page for the Help Center integration.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
