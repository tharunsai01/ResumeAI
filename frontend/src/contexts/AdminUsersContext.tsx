import React, { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { mockAdminUsers } from "../data/mockAdminUsers"
import type { AdminUser, AdminUserStatus } from "../data/mockAdminUsers"

interface AdminUsersContextType {
  users: AdminUser[]
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>
  updateUserStatus: (id: string, status: AdminUserStatus) => void
  getUserById: (id: string) => AdminUser | undefined
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined)

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers)

  const updateUserStatus = (id: string, status: AdminUserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
  }

  const getUserById = (id: string) => {
    return users.find(u => u.id === id)
  }

  return (
    <AdminUsersContext.Provider value={{ users, setUsers, updateUserStatus, getUserById }}>
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

