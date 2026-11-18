import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { profileService } from "../../services/profileService"
import type { CandidateProfile } from "../../data/mockProfile"
import { staggerContainer, slideUp } from "../../lib/animations"
import { ArrowLeft, Mail, MapPin, Phone, Globe, ExternalLink } from "lucide-react"

export default function CandidateProfilePreview() {
  const navigate = useNavigate()
  const [profile] = React.useState<CandidateProfile | null>(profileService.getCandidateProfile())

  if (!profile) return null

  return (
    <DashboardShell type="candidate" userName={profile.fullName.split(' ')[0]}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6 pb-20">
        
        {/* Navigation */}
        <motion.div variants={slideUp} className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => navigate("/candidate/profile")}
            className="p-2 rounded-full hover:bg-brand-gray/50 text-brand-navy/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Public Profile Preview</h1>
            <p className="text-brand-navy/60">This is how recruiters see your profile.</p>
          </div>
        </motion.div>

        {/* Public Profile Card */}
        <motion.div variants={slideUp}>
          <Card className="overflow-hidden border-none shadow-xl ">
            <div className="h-40 bg-gradient-to-r from-brand-navy to-brand-indigo relative" />
            
            <CardContent className="px-8 pb-10 pt-0 relative">
              <div className="flex justify-between items-start -mt-16 mb-6">
                <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg w-32 h-32 bg-brand-light flex items-center justify-center bg-white">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl text-brand-navy/30 font-display font-bold">{profile.fullName.charAt(0)}</span>
                  )}
                </div>
                {profile.openToWork && (
                  <Badge variant="success" className="mt-20 font-medium tracking-wide">
                    OPEN TO WORK
                  </Badge>
                )}
              </div>

              <div className="space-y-8">
                {/* Header Info */}
                <div>
                  <h1 className="text-3xl font-bold font-display text-brand-navy">{profile.fullName}</h1>
                  <p className="text-xl text-brand-indigo font-medium mt-1">{profile.currentRole}</p>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-brand-navy/60 mt-4">
                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.location}</div>
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{profile.email}</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{profile.phone}</div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-brand-navy/50 hover:text-brand-indigo transition-colors flex items-center gap-1 text-sm"><Globe className="w-4 h-4" /> LinkedIn</a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-brand-navy/50 hover:text-brand-indigo transition-colors flex items-center gap-1 text-sm"><Globe className="w-4 h-4" /> GitHub</a>
                    <a href="https://example.com" target="_blank" rel="noreferrer" className="text-brand-navy/50 hover:text-brand-indigo transition-colors flex items-center gap-1 text-sm"><ExternalLink className="w-4 h-4" /> Portfolio</a>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy mb-3">About</h3>
                  <p className="text-brand-navy/80 text-sm leading-relaxed max-w-3xl">{profile.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Experience */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-navy mb-4">Experience</h3>
                    <div className="space-y-6">
                      {profile.experience.map(exp => (
                        <div key={exp.id} className="relative pl-5 border-l-2 border-brand-gray/80">
                          <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brand-indigo" />
                          <h4 className="font-semibold text-brand-navy">{exp.jobTitle}</h4>
                          <p className="text-sm text-brand-indigo font-medium mb-1">{exp.company}</p>
                          <p className="text-xs text-brand-navy/60 mb-2">{exp.startDate} – {exp.endDate} • {exp.location}</p>
                          <p className="text-sm text-brand-navy/70 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education & Skills */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-navy mb-4">Education</h3>
                      <div className="space-y-4">
                        {profile.education.map(edu => (
                          <div key={edu.id} className="bg-brand-light p-4 rounded-xl border border-brand-gray/50">
                            <h4 className="font-semibold text-brand-navy">{edu.degree}</h4>
                            <p className="text-sm font-medium text-brand-navy/70 mt-1">{edu.fieldOfStudy}</p>
                            <p className="text-xs text-brand-indigo font-medium mt-1">{edu.institution}</p>
                            <p className="text-xs text-brand-navy/60 mt-1">{edu.startYear} – {edu.endYear}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-brand-navy mb-4">Top Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                          <Badge key={skill.id} variant="secondary" className="bg-brand-gray/20 text-brand-navy hover:bg-brand-gray/30 transition-colors">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardShell>
  )
}
