import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminEmptyState } from "../../components/admin/AdminEmptyState"
import { AlertOctagon } from "lucide-react"

export default function AdminComplaintForm() {
  return (
    <AdminShell>
      <AdminPageHeader 
        title="Report an Issue" 
        description="Report a technical problem or platform issue."
      />
      
      <AdminEmptyState 
        icon={AlertOctagon}
        title="Submit a Ticket"
        description="Internal ticketing system for administrators."
      />
    </AdminShell>
  )
}
