import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { Users, AlertOctagon, Tags, ScrollText, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    { title: "Manage Users", icon: Users, path: "/admin/users", color: "text-brand-blue", bg: "bg-brand-blue/10" },
    { title: "Review Complaints", icon: AlertOctagon, path: "/admin/complaints", color: "text-semantic-warning", bg: "bg-semantic-warning/10" },
    { title: "Manage Skill Taxonomy", icon: Tags, path: "/admin/skills", color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
    { title: "View Audit Logs", icon: ScrollText, path: "/admin/audit-logs", color: "text-brand-navy", bg: "bg-brand-navy/10" },
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-display font-semibold text-brand-navy">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="flex items-center justify-between p-3 rounded-xl border border-brand-gray/30 hover:border-brand-gray/60 hover:bg-brand-light transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-brand-navy text-sm">{action.title}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-navy/30 group-hover:text-brand-navy/60 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
