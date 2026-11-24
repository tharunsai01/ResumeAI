import React, { createContext, useContext, useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import type { 
  SkillTaxonomy, 
  SkillCategory, 
  TaxonomyActivity
} from "../data/mockAdminSkills"
import {
  initialSkillTaxonomy, 
  initialSkillCategories, 
  initialTaxonomyActivity 
} from "../data/mockAdminSkills"

interface AdminSkillsContextType {
  skills: SkillTaxonomy[]
  categories: SkillCategory[]
  activities: TaxonomyActivity[]
  
  addSkill: (skill: Omit<SkillTaxonomy, "id" | "usageCount" | "createdAt" | "updatedAt">) => void
  updateSkill: (id: string, updates: Partial<SkillTaxonomy>) => void
  toggleSkillStatus: (id: string) => void
  
  addCategory: (category: Omit<SkillCategory, "id">) => void
  updateCategory: (id: string, updates: Partial<SkillCategory>) => void
  toggleCategoryStatus: (id: string) => void
}

const AdminSkillsContext = createContext<AdminSkillsContextType | undefined>(undefined)

export const AdminSkillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skills, setSkills] = useState<SkillTaxonomy[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [activities, setActivities] = useState<TaxonomyActivity[]>([])

  useEffect(() => {
    // In a real app, fetch from API here. Using mock data.
    setSkills([...initialSkillTaxonomy])
    setCategories([...initialSkillCategories])
    setActivities([...initialTaxonomyActivity])
  }, [])

  const addActivity = (action: string, skillName: string) => {
    const newActivity: TaxonomyActivity = {
      id: `act-${Date.now()}`,
      action,
      skill: skillName,
      actor: "Admin User",
      time: "Just now"
    }
    setActivities(prev => [newActivity, ...prev])
  }

  const addSkill = (skill: Omit<SkillTaxonomy, "id" | "usageCount" | "createdAt" | "updatedAt">) => {
    const newSkill: SkillTaxonomy = {
      ...skill,
      id: `sk-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    setSkills(prev => [newSkill, ...prev])
    addActivity("Added skill", newSkill.name)
  }

  const updateSkill = (id: string, updates: Partial<SkillTaxonomy>) => {
    setSkills(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates, updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
        addActivity("Updated skill", updated.name)
        return updated
      }
      return s
    }))
  }

  const toggleSkillStatus = (id: string) => {
    setSkills(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === "Active" ? "Inactive" : "Active"
        addActivity(`${newStatus === "Active" ? "Activated" : "Deactivated"} skill`, s.name)
        return { ...s, status: newStatus, updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
      }
      return s
    }))
  }

  const addCategory = (category: Omit<SkillCategory, "id">) => {
    const newCategory: SkillCategory = {
      ...category,
      id: `cat-${Date.now()}`
    }
    setCategories(prev => [...prev, newCategory])
    addActivity("Added category", newCategory.name)
  }

  const updateCategory = (id: string, updates: Partial<SkillCategory>) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates }
        addActivity("Updated category", updated.name)
        return updated
      }
      return c
    }))
  }

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === "Active" ? "Inactive" : "Active"
        addActivity(`${newStatus === "Active" ? "Activated" : "Deactivated"} category`, c.name)
        return { ...c, status: newStatus }
      }
      return c
    }))
  }

  return (
    <AdminSkillsContext.Provider value={{
      skills,
      categories,
      activities,
      addSkill,
      updateSkill,
      toggleSkillStatus,
      addCategory,
      updateCategory,
      toggleCategoryStatus
    }}>
      {children}
    </AdminSkillsContext.Provider>
  )
}

export const useAdminSkills = () => {
  const context = useContext(AdminSkillsContext)
  if (context === undefined) {
    throw new Error("useAdminSkills must be used within an AdminSkillsProvider")
  }
  return context
}

export const AdminSkillsOutlet = () => {
  return (
    <AdminSkillsProvider>
      <Outlet />
    </AdminSkillsProvider>
  )
}
