/**
 * Authentication and User Types
 */

export type UserRole = "candidate" | "recruiter" | "admin"

export interface User {
  id: string
  email: string
  name: string
  fullName?: string
  role: UserRole
  company?: string // Optional, for recruiters
  avatarUrl?: string | null
}

export interface SessionState {
  user: User | null
  isLoading: boolean
}
