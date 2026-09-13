import * as React from "react"
import { motion } from "framer-motion"
import { BarChart as BarChartIcon, TrendingUp, Users, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { staggerContainer, slideUp } from "../../lib/animations"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { applicationService } from "../../services/applicationService"

export default function RecruiterAnalytics() {
  const [stats] = React.useState(() => {
    const apps = applicationService.getApplications()
    return {
      total: apps.length,
      screened: apps.filter(a => a.status !== "Applied").length,
      screening: apps.filter(a => a.status === "AI Screened").length,
      shortlisted: apps.filter(a => ["Shortlisted", "Interview", "Offer", "Hired"].includes(a.status)).length,
      interview: apps.filter(a => a.status === "Interview").length,
      hired: apps.filter(a => a.status === "Hired").length,
      rejected: apps.filter(a => a.status === "Rejected").length
    }
  })

  React.useEffect(() => {
    // If we need to listen for application updates, do it here
  }, [])

  const funnelData = [
    { name: 'Applied', value: stats.total },
    { name: 'AI Screened', value: stats.screened },
    { name: 'Shortlisted', value: stats.shortlisted },
    { name: 'Hired', value: stats.hired },
  ]

  const trendData = [
    { name: 'Week 1', applicants: 12 },
    { name: 'Week 2', applicants: 19 },
    { name: 'Week 3', applicants: 15 },
    { name: 'Week 4', applicants: 28 },
    { name: 'Week 5', applicants: Math.max(stats.total, 35) },
  ]

  const matchData = [
    { name: '<60%', count: Math.round(stats.total * 0.1) },
    { name: '60-75%', count: Math.round(stats.total * 0.4) },
    { name: '75-90%', count: Math.round(stats.total * 0.3) },
    { name: '>90%', count: Math.round(stats.total * 0.2) },
  ]

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        <motion.div variants={slideUp}>
          <h1 className="text-3xl font-display font-semibold text-brand-navy flex items-center gap-2">
            <BarChartIcon className="w-8 h-8 text-brand-indigo" /> Analytics & Reports
          </h1>
          <p className="text-brand-navy/60 mt-1">Track your recruitment pipeline performance and AI screening efficiency.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={slideUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy/60">Total Applicants</p>
                    <h3 className="text-2xl font-bold text-brand-navy">{stats.total}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={slideUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy/60">Conversion Rate</p>
                    <h3 className="text-2xl font-bold text-brand-navy">
                      {stats.total > 0 ? Math.round((stats.hired / stats.total) * 100) : 0}%
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={slideUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-semantic-warning/10 text-semantic-warning rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy/60">Avg. Match Score</p>
                    <h3 className="text-2xl font-bold text-brand-navy">78%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={slideUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-semantic-success/10 text-semantic-success rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-navy/60">Time to Hire</p>
                    <h3 className="text-2xl font-bold text-brand-navy">14 Days</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={slideUp}>
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Application Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="applicants" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorApplicants)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp}>
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>Recruitment Funnel</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1E293B', fontSize: 13, fontWeight: 500}} width={100} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#4F46E5" radius={[0, 8, 8, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle>AI Match Score Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
