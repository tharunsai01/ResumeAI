import { motion } from "framer-motion"
import { MapPin, Briefcase, GraduationCap, FileText } from "lucide-react"
import { Card } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { MatchScore } from "./MatchScore"
import { hoverElevation } from "../../lib/animations"

export interface CandidateCardProps {
  id: string
  name: string
  role: string
  location: string
  experience: string
  education: string
  matchScore: number
  skills: string[]
  missingSkills?: string[]
}

export function CandidateCard({
  name,
  role,
  location,
  experience,
  education,
  matchScore,
  skills,
  missingSkills = []
}: CandidateCardProps) {
  return (
    <motion.div variants={hoverElevation} whileHover="whileHover">
      <Card className="flex flex-col sm:flex-row p-6 gap-6 hover:border-brand-indigo/30 transition-colors">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display font-semibold text-xl text-brand-navy">
                {name}
              </h3>
              <p className="text-brand-indigo font-medium">{role}</p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-brand-navy/70">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 opacity-70" />
                  {location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 opacity-70" />
                  {experience}
                </div>
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1 opacity-70" />
                  {education}
                </div>
              </div>
            </div>
            
            <div className="flex items-center sm:flex-col gap-3 sm:items-end">
              <MatchScore score={matchScore} size="sm" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-1" />
                  Resume
                </Button>
                <Button size="sm">Shortlist</Button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-brand-navy uppercase tracking-wider mb-2">Matched Skills</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(skill => (
                <Badge key={skill} variant="success">{skill}</Badge>
              ))}
            </div>
            
            {missingSkills.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-brand-navy uppercase tracking-wider mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map(skill => (
                    <Badge key={skill} variant="warning">{skill}</Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
