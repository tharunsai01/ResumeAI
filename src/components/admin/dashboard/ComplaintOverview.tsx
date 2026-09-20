import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { complaintOverview } from "../../../data/mockAdminDashboard"
import { AlertOctagon, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function ComplaintOverview() {
  const navigate = useNavigate()

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-brand-indigo" />
          Complaint Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-semantic-warning/5 border border-semantic-warning/10">
            <span className="text-sm font-medium text-brand-navy/80">Open</span>
            <span className="font-bold text-semantic-warning">{complaintOverview.open}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-brand-light">
            <span className="text-sm font-medium text-brand-navy/80">In Review</span>
            <span className="font-bold text-brand-indigo">{complaintOverview.inReview}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-semantic-success/5 border border-semantic-success/10">
            <span className="text-sm font-medium text-brand-navy/80">Resolved</span>
            <span className="font-bold text-semantic-success">{complaintOverview.resolved}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-semantic-error/5 border border-semantic-error/10">
            <span className="text-sm font-medium text-brand-navy/80">High Priority</span>
            <span className="font-bold text-semantic-error">{complaintOverview.highPriority}</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/admin/complaints')}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium text-brand-indigo hover:text-brand-indigo/80 transition-colors py-2 bg-brand-indigo/5 rounded-lg hover:bg-brand-indigo/10"
        >
          View Complaints <ArrowRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  )
}
