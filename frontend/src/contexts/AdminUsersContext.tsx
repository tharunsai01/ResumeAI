import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { mockAdminUsers } from "../data/mockAdminUsers"
import type { AdminUser, AdminUserStatus } from "../data/mockAdminUsers"

import { env } from "../config/env"
import { httpClient } from "../services/api/httpClient"

interface ApiUser {
  _id: string
  fullName: string
  email: string
  role: "admin" | "candidate" | "recruiter"
  status: "active" | "suspended" | "inactive"
  isVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

function toAdminUser(user: ApiUser): AdminUser {
  return {
    id: user._id,
    name: user.fullName,
    email: user.email,
    role: { admin: "Administrator", candidate: "Candidate", recruiter: "Recruiter" }[user.role] as AdminUser["role"],
    status: user.status === "active" ? "Active" : user.status === "suspended" ? "Suspended" : "Pending",
    verification: user.isVerified ? "Verified" : "Unverified",
    joinedAt: new Date(user.createdAt).toLocaleDateString(),
    lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never",
  }
}

interface AdminUsersContextType {
  users: AdminUser[]
  loading: boolean
  error: string
  updateUserStatus: (id: string, status: AdminUserStatus) => Promise<void>
  getUserById: (id: string) => AdminUser | undefined
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined)

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(env.useMock ? mockAdminUsers : [])
  const [loading, setLoading] = useState(!env.useMock)
  const [error, setError] = useState("")

  useEffect(() => {
    if (env.useMock) return
    let active = true
    async function load() {
      const users: ApiUser[] = []
      let page = 1
      let totalPages = 1
      do {
        const { data } = await httpClient.get<{ data: { users: ApiUser[]; pagination: { totalPages: number } } }>(
          `/admin/users?page=${page}&limit=100`,
        )
        users.push(...data.users)
        totalPages = data.pagination.totalPages
        page++
      } while (active && page <= totalPages)
      if (active) setUsers(users.map(toAdminUser))
    }
    void load().catch(() => { if (active) setError("Unable to load users.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const updateUserStatus = async (id: string, status: AdminUserStatus) => {
    if (!env.useMock) {
      await httpClient.patch(`/admin/users/${id}/status`, { status: status === "Pending" ? "inactive" : status.toLowerCase() })
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
  }

  const getUserById = (id: string) => {
    return users.find(u => u.id === id)
  }

  return (
    <AdminUsersContext.Provider value={{ users, loading, error, updateUserStatus, getUserById }}>
      {children}
    </AdminUsersContext.Provider>
  )
}

export function AdminUsersOutlet() {
  return (
    <AdminUsersProvider>
      <Outlet />
    </AdminUsersProvider>
  )
}

export function useAdminUsers() {
  const context = useContext(AdminUsersContext)
  if (context === undefined) {
    throw new Error("useAdminUsers must be used within an AdminUsersProvider")
  }
  return context
}

