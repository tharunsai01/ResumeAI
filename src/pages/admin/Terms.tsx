import { AdminShell } from "../../components/layout/AdminShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { FileText } from "lucide-react"

export default function AdminTerms() {
  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Terms & Conditions</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-indigo" />
              Platform Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-brand-navy/70">
            <p>1. Administrator access is restricted to authorized personnel only.</p>
            <p>2. Actions taken on this platform are audited and monitored.</p>
            <p>3. Do not misuse platform privileges to access private candidate data without authorization.</p>
            <p>4. These terms are subject to change by the organization.</p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
