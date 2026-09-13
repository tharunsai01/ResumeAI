import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"

export default function AboutPage() {
  return (
    <DashboardShell type="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">About HireSmart AI</h1>
          <p className="text-brand-navy/60 mt-2">Learn about our mission and technology.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>HireSmart AI is an AI-Based Resume Screening & Job Matching System designed to bridge the gap between talented candidates and the right opportunities through intelligent analysis.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
