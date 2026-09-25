import { motion } from "framer-motion"
import { Briefcase, MapPin, DollarSign, Building, Bookmark, BookmarkCheck } from "lucide-react"
import { CardHeader, CardContent, CardFooter } from "../ui/Card"
import { PremiumCard } from "../ui/PremiumCard"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { MatchScore } from "./MatchScore"
import { hoverElevation } from "../../lib/animations"

export interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  experience: string
  matchScore?: number
  skills: string[]
  isApplied?: boolean
  isSaved?: boolean
  onSave?: (e: React.MouseEvent) => void
  onClick?: () => void
  onApply?: (e: React.MouseEvent) => void
}

export function JobCard({
  title,
  company,
  location,
  salary,
  type,
  experience,
  matchScore,
  skills,
  isApplied,
  isSaved,
  onSave,
  onClick,
  onApply
}: JobCardProps) {
  return (
    <motion.div variants={hoverElevation} whileHover="whileHover" onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      <PremiumCard className="h-full flex flex-col group transition-colors">
        <CardHeader className="pb-3 flex-row items-start justify-between">
          <div>
            <h3 className="premium-card-text font-display font-semibold text-lg text-slate-800 dark:text-slate-200 transition-colors line-clamp-1">
              {title}
            </h3>
            <div className="premium-card-text flex items-center text-sm text-slate-600 dark:text-slate-400 mt-1">
              <Building className="w-4 h-4 mr-1" />
              {company}
            </div>
          </div>
          {matchScore !== undefined && (
            <MatchScore score={matchScore} size="sm" />
          )}
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <div className="premium-card-text flex flex-wrap gap-3 mb-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 opacity-70" />
              {location}
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1 opacity-70" />
              {salary}
            </div>
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1 opacity-70" />
              {type}
            </div>
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1 opacity-70" />
              {experience}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline">+{skills.length - 3}</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex gap-2">
          <Button 
            className="flex-1" 
            variant={isApplied ? "outline" : "default"}
            disabled={isApplied}
            onClick={(e) => {
              e.stopPropagation()
              if (onApply) onApply(e)
            }}
          >
            {isApplied ? "Applied" : "Apply Now"}
          </Button>
          <Button 
            variant="outline" 
            className="px-3"
            onClick={(e) => {
              e.stopPropagation()
              if (onSave) onSave(e)
            }}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 text-brand-indigo" /> : <Bookmark className="w-5 h-5 text-brand-navy/60" />}
          </Button>
        </CardFooter>
      </PremiumCard>
    </motion.div>
  )
}
