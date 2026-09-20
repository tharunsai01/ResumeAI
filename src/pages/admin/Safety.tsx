import { AdminShell } from "../../components/layout/AdminShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Shield } from "lucide-react"

export default function AdminSafety() {
  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Safety Tips</h1>
          <p className="text-brand-navy/60 mt-2">Platform security and safety guidelines.</p>
        </div>
        
        <Card className="border-t-4 border-t-brand-indigo">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-indigo" />
              Administrator Safety
            </CardTitle>
            <CardDescription>Important guidelines to keep the platform secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>1. <strong>Protect credentials.</strong> Never share your administrator password with anyone.</p>
            <p>2. <strong>Enable 2FA.</strong> Ensure Two-Factor Authentication is enabled on your account.</p>
            <p>3. <strong>Verify actions.</strong> Always double-check user suspension and platform configuration changes.</p>
            <p>4. <strong>Sign out.</strong> Always sign out from active sessions on shared devices.</p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
