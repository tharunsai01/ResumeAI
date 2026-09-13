import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Shield } from "lucide-react"

export default function SafetyPage() {
  return (
    <DashboardShell type="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Safety Tips</h1>
          <p className="text-brand-navy/60 mt-2">Protect yourself while searching for jobs.</p>
        </div>
        
        <Card className="border-t-4 border-t-semantic-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-semantic-warning" />
              Stay Safe on HireSmart AI
            </CardTitle>
            <CardDescription>Important guidelines to keep your data secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>1. <strong>Never pay for a job.</strong> Legitimate employers will never ask for payment, processing fees, or security deposits.</p>
            <p>2. <strong>Protect personal information.</strong> Do not share your bank account details, credit card information, or passwords.</p>
            <p>3. <strong>Beware of OTP requests.</strong> Never share OTPs (One Time Passwords) with anyone claiming to be a recruiter.</p>
            <p>4. <strong>Verify the company.</strong> Always research the employer independently before accepting offers.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
