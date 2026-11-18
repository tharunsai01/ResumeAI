import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminEmptyState } from "../../components/admin/AdminEmptyState"
import { HelpCircle } from "lucide-react"

export default function AdminHelp() {
  return (
    <AdminShell>
      <AdminPageHeader 
        title="Help Center" 
        description="Support resources and documentation for administrators."
      />
      
      <AdminEmptyState 
        icon={HelpCircle}
        title="Admin Documentation"
        description="Guides and FAQs for managing the HireSmart AI platform."
      />
    </AdminShell>
  )
}
