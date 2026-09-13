import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"

export default function PrivacyPage() {
  return (
    <DashboardShell type="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Privacy Policy</h1>
          <p className="text-brand-navy/60 mt-2">How we protect and manage your data.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Data Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>Your resume and profile data are processed locally in this demo environment. In a production environment, HireSmart AI adheres to strict data protection standards.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
