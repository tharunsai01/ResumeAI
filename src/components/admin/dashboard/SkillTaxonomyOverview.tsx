import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import { skillTaxonomyOverview } from "../../../data/mockAdminDashboard"
import { Tags, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SkillTaxonomyOverview() {
  const navigate = useNavigate()

  return (
    <PremiumCard className="flex flex-col">
      <PremiumCardHeader className="pb-2">
        <PremiumCardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
          <Tags className="w-5 h-5 text-brand-indigo" />
          Skill Taxonomy
        </PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent className="flex-1 flex flex-col justify-between mt-4">
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-brand-light rounded-lg p-3 text-center border border-brand-gray/30">
            <span className="block text-2xl font-bold text-brand-indigo">{skillTaxonomyOverview.totalSkills}</span>
            <span className="text-[10px] uppercase font-semibold text-brand-navy/50 tracking-wider">Total</span>
          </div>
          <div className="bg-brand-light rounded-lg p-3 text-center border border-brand-gray/30">
            <span className="block text-2xl font-bold text-brand-navy">{skillTaxonomyOverview.categories}</span>
            <span className="text-[10px] uppercase font-semibold text-brand-navy/50 tracking-wider">Cats</span>
          </div>
          <div className="bg-brand-light rounded-lg p-3 text-center border border-brand-gray/30">
            <span className="block text-2xl font-bold text-brand-navy/70">{skillTaxonomyOverview.recentlyUpdated}</span>
            <span className="text-[10px] uppercase font-semibold text-brand-navy/50 tracking-wider">Updated</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-2">Categories</h4>
          <div className="flex flex-wrap gap-1.5">
            {skillTaxonomyOverview.exampleCategories.map((cat, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 bg-brand-gray/10 text-brand-navy/70 rounded-md font-medium border border-brand-gray/20">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/admin/skills')}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium text-brand-indigo hover:text-brand-indigo/80 transition-colors py-2 bg-brand-indigo/5 rounded-lg hover:bg-brand-indigo/10"
        >
          Manage Skills <ArrowRight className="w-4 h-4" />
        </button>
      </PremiumCardContent>
    </PremiumCard>
  )
}
