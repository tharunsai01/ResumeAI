import { AdminShell } from "../../components/layout/AdminShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Lock } from "lucide-react"

export default function AdminPrivacy() {
  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Privacy Policy</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-indigo" />
              Administrator Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>1. We collect administrative usage logs to ensure platform security.</p>
            <p>2. Your IP address and device information are logged for session management.</p>
            <p>3. We do not sell administrator data to third parties.</p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
