import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { 
  Activity, RefreshCw, Server, Database, ShieldAlert, Cpu, 
  FileText, BrainCircuit, HardDrive, CheckCircle2, AlertTriangle, 
  XCircle, ArrowRight, ShieldCheck
} from "lucide-react"
import { useAdminSystemHealth } from "../../contexts/AdminSystemHealthContext"
import { AdminServiceDetailsModal } from "./components/system-health/AdminServiceDetailsModal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import type { ServiceHealth } from "../../data/mockAdminSystemHealth"

export default function AdminSystemHealth() {
  const { healthData, refreshHealth } = useAdminSystemHealth()
  const navigate = useNavigate()

  // State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [viewingService, setViewingService] = useState<ServiceHealth | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleRefresh = () => {
    refreshHealth()
    showToast("System health refreshed.")
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleViewService = (service: ServiceHealth) => {
    setViewingService(service)
    setDetailsModalOpen(true)
  }

  // Calculations
  const servicesOperational = healthData.services.filter(s => s.status === 'Operational').length
  const servicesDegraded = healthData.services.filter(s => s.status === 'Degraded').length
  const servicesUnavailable = healthData.services.filter(s => s.status === 'Unavailable').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Operational": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case "Degraded": return <AlertTriangle className="w-5 h-5 text-semantic-warning" />
      case "Unavailable": return <XCircle className="w-5 h-5 text-semantic-error" />
      default: return null
    }
  }

  const getServiceIcon = (id: string) => {
    switch (id) {
      case "app": return <Server className="w-5 h-5 text-brand-indigo" />
      case "api": return <Activity className="w-5 h-5 text-brand-blue" />
      case "db": return <Database className="w-5 h-5 text-brand-purple" />
      case "auth": return <ShieldCheck className="w-5 h-5 text-emerald-500" />
      case "resume": return <FileText className="w-5 h-5 text-amber-500" />
      case "ai": return <BrainCircuit className="w-5 h-5 text-rose-500" />
      case "storage": return <HardDrive className="w-5 h-5 text-cyan-500" />
      case "sys": return <Cpu className="w-5 h-5 text-slate-500" />
      default: return <Server className="w-5 h-5 text-brand-navy" />
    }
  }

  return (
    <AdminShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg z-[100]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <AdminPageHeader 
          title="System Health" 
          description="Monitor platform services, processing systems, and operational health."
          statusIndicator={{ 
            label: healthData.summary.overallStatus === "Operational" ? "All Systems Operational" : `System ${healthData.summary.overallStatus}`, 
            isHealthy: healthData.summary.overallStatus === "Operational" 
          }}
          action={
            <div className="flex items-center gap-4">
              <span className="text-sm text-brand-navy/50 font-medium hidden sm:inline-block">
                Last checked: {healthData.summary.lastChecked}
              </span>
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                className="bg-white border-brand-gray/20 text-brand-navy hover:bg-brand-light"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> 
                Refresh Status
              </Button>
            </div>
          }
        />

        {/* TOP SUMMARY */}
        <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-2 bg-gradient-to-br from-brand-navy to-brand-indigo text-white border-none shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Activity className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/70 font-medium uppercase tracking-wider text-xs mb-1">Overall System Health</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-display font-bold text-white">{healthData.summary.uptime}</h3>
                  <span className="text-emerald-400 font-medium pb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {healthData.summary.overallStatus}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 font-medium text-sm mb-1">Services Operational</p>
                <p className="text-2xl font-bold text-white">{servicesOperational} / {healthData.services.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col justify-center bg-brand-light/30 border-brand-gray/20">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Degraded</p>
                <h3 className="text-2xl font-display font-bold text-brand-navy">{servicesDegraded}</h3>
              </div>
              <div className="p-3 bg-semantic-warning/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-semantic-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center bg-brand-light/30 border-brand-gray/20">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Unavailable</p>
                <h3 className="text-2xl font-display font-bold text-brand-navy">{servicesUnavailable}</h3>
              </div>
              <div className="p-3 bg-semantic-error/10 rounded-xl">
                <XCircle className="w-5 h-5 text-semantic-error" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SERVICE GRID */}
        <motion.div variants={slideUp}>
          <h3 className="text-lg font-display font-semibold text-brand-navy mb-4">Core Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthData.services.map((service) => (
              <Card 
                key={service.id} 
                className={cn(
                  "cursor-pointer hover:border-brand-indigo/30 hover:shadow-md transition-all duration-200 group relative overflow-hidden",
                  service.status === 'Degraded' && "border-semantic-warning/30 bg-semantic-warning/5",
                  service.status === 'Unavailable' && "border-semantic-error/30 bg-semantic-error/5"
                )}
                onClick={() => handleViewService(service)}
              >
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  service.status === 'Operational' ? "bg-emerald-500" : 
                  service.status === 'Degraded' ? "bg-semantic-warning" : "bg-semantic-error"
                )} />
                <CardContent className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-brand-light rounded-lg group-hover:bg-brand-indigo/5 transition-colors">
                      {getServiceIcon(service.id)}
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  <h4 className="font-semibold text-brand-navy mb-1">{service.name}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn(
                      "font-medium",
                      service.status === 'Operational' ? "text-emerald-600" :
                      service.status === 'Degraded' ? "text-semantic-warning" : "text-semantic-error"
                    )}>
                      {service.status}
                    </span>
                    <span className="text-brand-navy/50">{service.responseTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CHARTS AND LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* HISTORY */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-brand-gray/10">
                <div>
                  <CardTitle className="text-[16px] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-indigo" />
                    Health History
                  </CardTitle>
                  <p className="text-xs text-brand-navy/50 mt-1">System Health — Last 24 Hours</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-1 bg-brand-indigo/10 text-brand-indigo rounded">24 Hours</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-1 text-brand-navy/40 hover:bg-brand-light rounded cursor-pointer transition-colors">7 Days</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[200px] w-full flex items-end justify-between gap-2">
                  {healthData.history.map((point, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                      <div className="w-full relative bg-brand-light rounded-t-md h-full flex items-end overflow-hidden group">
                        <div 
                          className="w-full bg-brand-indigo/20 group-hover:bg-brand-indigo/40 transition-colors relative" 
                          style={{ height: `${(point.value / 100) * 100}%` }}
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-brand-indigo"></div>
                        </div>
                      </div>
                      <div className="text-[10px] font-medium text-brand-navy/40">{point.time}</div>
                      <div className="text-xs font-semibold text-brand-navy/80">{point.value}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* EVENTS */}
          <motion.div variants={slideUp}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2 border-b border-brand-gray/10">
                <CardTitle className="text-[16px] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-brand-navy" />
                  Recent System Events
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="space-y-4">
                  {healthData.events.map((event, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        {event.severity === 'Info' && <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />}
                        {event.severity === 'Warning' && <div className="w-2 h-2 rounded-full bg-semantic-warning ring-4 ring-semantic-warning/20" />}
                        {event.severity === 'Critical' && <div className="w-2 h-2 rounded-full bg-semantic-error ring-4 ring-semantic-error/20" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium leading-tight",
                          event.severity === 'Warning' ? "text-semantic-warning" :
                          event.severity === 'Critical' ? "text-semantic-error" : "text-brand-navy"
                        )}>
                          {event.event}
                        </p>
                        <p className="text-xs text-brand-navy/50 mt-1">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* SYSTEM RESOURCES WIDGET */}
        <motion.div variants={slideUp}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[16px] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-navy/60" />
                Infrastructure & Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-brand-navy/60 uppercase">CPU Usage</span>
                    <span className="text-sm font-bold text-brand-navy">42%</span>
                  </div>
                  <div className="w-full bg-brand-gray/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[42%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-brand-navy/60 uppercase">Memory</span>
                    <span className="text-sm font-bold text-brand-navy">58%</span>
                  </div>
                  <div className="w-full bg-brand-gray/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brand-blue h-full w-[58%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-brand-navy/60 uppercase">Storage</span>
                    <span className="text-sm font-bold text-brand-navy">37%</span>
                  </div>
                  <div className="w-full bg-brand-gray/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brand-purple h-full w-[37%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-brand-navy/60 uppercase">Network</span>
                    <span className="text-sm font-bold text-emerald-600">Healthy</span>
                  </div>
                  <div className="w-full bg-brand-gray/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[100%] opacity-50"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* BOTTOM LINKS */}
        <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-brand-light/30 border-brand-gray/20">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-brand-indigo" />
                  <h4 className="text-sm font-bold text-brand-navy">AI Evaluation & Fairness</h4>
                </div>
                <p className="text-xs text-brand-navy/70 leading-relaxed">
                  Review AI quality, stability, fairness testing, and resume security evaluation.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/ai-evaluation')} 
                className="w-full sm:w-auto self-start text-xs h-8 bg-white"
              >
                Open AI Evaluation <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-brand-light/30 border-brand-gray/20">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-brand-navy/60" />
                  <h4 className="text-sm font-bold text-brand-navy">Audit Logging</h4>
                </div>
                <p className="text-xs text-brand-navy/70 leading-relaxed">
                  System health checks and operational shifts are recorded as platform events for monitoring and auditability.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/audit-logs')} 
                className="w-full sm:w-auto self-start text-xs h-8 bg-white"
              >
                View Audit Logs <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* SERVICE DETAILS DRAWER/MODAL */}
      <AdminServiceDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setViewingService(null); }}
        service={viewingService}
      />
    </AdminShell>
  )
}
