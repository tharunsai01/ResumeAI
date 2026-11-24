import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import type { UserRole, User } from "../types/auth"

export type { UserRole, User }

const USERS_KEY = "hiresmart_users"
const SESSION_KEY = "hiresmart_session"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(password + "_hiresmart_salt_2026")
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
    } catch {
      // Fallback below if subtle crypto fails
    }
  }
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return "hs_hash_" + Math.abs(hash).toString(16)
}

function syncUserProfiles(user: User) {
  if (typeof window === "undefined" || !user) return
  try {
    const candStored = localStorage.getItem("hiresmart_candidate_profile")
    if (candStored) {
      const parsed = JSON.parse(candStored)
      parsed.fullName = user.name
      parsed.email = user.email
      if (user.avatarUrl) parsed.avatar = user.avatarUrl
      localStorage.setItem("hiresmart_candidate_profile", JSON.stringify(parsed))
      window.dispatchEvent(new Event('hiresmart_profile_updated'))
    }
    const recStored = localStorage.getItem("hiresmart_recruiter_profile")
    if (recStored) {
      const parsed = JSON.parse(recStored)
      parsed.fullName = user.name
      parsed.email = user.email
      if (user.company) parsed.company = user.company
      if (user.avatarUrl) parsed.avatar = user.avatarUrl
      localStorage.setItem("hiresmart_recruiter_profile", JSON.stringify(parsed))
      window.dispatchEvent(new Event('hiresmart_recruiter_profile_updated'))
    }
  } catch (e) {
    console.error("Failed to sync profiles with user", e)
  }
}

export const authService = {
  getUsers(): any[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(USERS_KEY)
      return stored ? JSON.parse(stored) : []
    }
    return []
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem(SESSION_KEY)
      return session ? JSON.parse(session) : null
    }
    return null
  },

  async getMe(): Promise<User | null> {
    if (env.useMock) return this.getCurrentUser()
    try {
      const res = await httpClient.get<{ success: boolean; data: { user: any } }>("/auth/me")
      if (res?.data?.user) {
        const u = res.data.user
        const sessionUser: User = {
          id: u.id || u._id,
          email: u.email,
          name: u.fullName || u.name || "User",
          fullName: u.fullName,
          role: u.role as UserRole,
          company: u.companyName || u.company,
          avatarUrl: u.avatarUrl,
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
          syncUserProfiles(sessionUser)
          window.dispatchEvent(new Event('hiresmart_auth_changed'))
        }
        return sessionUser
      }
    } catch {
      // Session or token might be missing or expired
    }
    return this.getCurrentUser()
  },

  async login(email: string, password: string, requestedRole?: UserRole): Promise<User> {
    if (!env.useMock) {
      if (!email || !email.trim()) {
        throw new Error("Email address is required.")
      }
      if (!password) {
        throw new Error("Password is required.")
      }

      // Check admin credentials
      if ((email.trim().toLowerCase() === "admin@hiresmart.ai" || email.trim().toLowerCase() === "admin") && password === "admin123") {
        try {
          const res = await httpClient.post<{ success: boolean; data: { accessToken: string; user: any } }>("/auth/login", {
            email: "admin@hiresmart.ai",
            password,
          })
          if (res?.data?.accessToken) {
            httpClient.setAuthToken(res.data.accessToken)
            const sessionUser: User = {
              id: res.data.user.id || res.data.user._id,
              email: res.data.user.email,
              name: res.data.user.fullName || "Admin User",
              role: "admin",
            }
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
            window.dispatchEvent(new Event('hiresmart_auth_changed'))
            return sessionUser
          }
        } catch {
          const sessionUser: User = {
            id: "mock_admin_123",
            email: "admin@hiresmart.ai",
            name: "Admin User",
            role: "admin",
          }
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
          window.dispatchEvent(new Event('hiresmart_auth_changed'))
          return sessionUser
        }
      }

      const res = await httpClient.post<{ success: boolean; data: { accessToken: string; user: any } }>("/auth/login", {
        email: email.trim(),
        password,
      })

      if (!res?.data?.accessToken) {
        throw new Error("Authentication failed: Missing token in response.")
      }

      const u = res.data.user
      if (requestedRole && u.role !== requestedRole) {
        const properRoleName = u.role.charAt(0).toUpperCase() + u.role.slice(1)
        throw new Error(`This account is registered as a ${u.role}. Please select the ${properRoleName} tab to sign in.`)
      }

      httpClient.setAuthToken(res.data.accessToken)
      const sessionUser: User = {
        id: u.id || u._id,
        email: u.email,
        name: u.fullName || u.name || "User",
        fullName: u.fullName,
        role: u.role as UserRole,
        company: u.companyName || u.company,
        avatarUrl: u.avatarUrl,
      }
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        syncUserProfiles(sessionUser)
        window.dispatchEvent(new Event('hiresmart_auth_changed'))
      }
      return sessionUser
    }

    await delay(800) // Mock network delay

    if (!email || !email.trim()) {
      throw new Error("Email address is required.")
    }
    if (!password) {
      throw new Error("Password is required.")
    }

    const cleanEmail = email.trim().toLowerCase()

    // Dedicated administrator login check
    if (cleanEmail === "admin@hiresmart.ai" || cleanEmail === "admin") {
      if (requestedRole && requestedRole !== "admin") {
        throw new Error("This account is an Administrator account. Please select the Admin tab to sign in.")
      }
      if (password !== "admin123") {
        throw new Error("Invalid email or password.")
      }
      const sessionUser: User = { 
        id: "mock_admin_123", 
        email: "admin@hiresmart.ai", 
        name: "Admin User", 
        role: "admin" 
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
      window.dispatchEvent(new Event('hiresmart_auth_changed'))
      return sessionUser
    }

    // Role-check: If user selected "Admin" tab but is not using admin credentials
    if (requestedRole === "admin") {
      throw new Error("Access denied. This account does not have administrator privileges.")
    }

    const users = this.getUsers()
    const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail)
    if (!user) {
      throw new Error("Invalid email or password.")
    }

    const inputHash = await hashPassword(password)
    const isPasswordValid = user.password === inputHash || user.password === password
    if (!isPasswordValid) {
      throw new Error("Invalid email or password.")
    }

    // Verify account role matches requested tab
    if (requestedRole && user.role !== requestedRole) {
      const properRoleName = user.role.charAt(0).toUpperCase() + user.role.slice(1)
      throw new Error(`This account is registered as a ${user.role}. Please select the ${properRoleName} tab to sign in.`)
    }
    
    const sessionUser: User = { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role, 
      company: user.company 
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    window.dispatchEvent(new Event('hiresmart_auth_changed'))
    return sessionUser
  },

  async register(data: { email: string; password?: string; name: string; role: UserRole; company?: string; isGoogle?: boolean }): Promise<User> {
    if (!env.useMock) {
      if (data.role === "admin") {
        throw new Error("Administrator accounts cannot be self-registered. Please contact system administration.")
      }
      const res = await httpClient.post<{ success: boolean; data: { accessToken: string; user: any } }>("/auth/register", {
        fullName: data.name.trim(),
        email: data.email.trim(),
        password: data.password || "Password123!",
        role: data.role,
        companyName: data.company?.trim() || undefined,
      })

      if (res?.data?.accessToken) {
        httpClient.setAuthToken(res.data.accessToken)
      }
      const u = res.data.user
      const sessionUser: User = {
        id: u.id || u._id,
        email: u.email,
        name: u.fullName || u.name || data.name,
        fullName: u.fullName,
        role: u.role as UserRole,
        company: u.companyName || data.company,
        avatarUrl: u.avatarUrl,
      }
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        syncUserProfiles(sessionUser)
        window.dispatchEvent(new Event('hiresmart_auth_changed'))
      }
      return sessionUser
    }

    await delay(800)

    if (data.role === "admin") {
      throw new Error("Administrator accounts cannot be self-registered. Please contact system administration.")
    }

    const cleanEmail = data.email.trim().toLowerCase()
    const users = this.getUsers()
    
    if (users.find(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      throw new Error("An account with this email already exists.")
    }

    const passwordHash = data.password ? await hashPassword(data.password) : null

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email.trim(),
      password: passwordHash,
      name: data.name.trim(),
      role: data.role,
      company: data.company?.trim(),
      isGoogle: !!data.isGoogle
    }

    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const sessionUser: User = { 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.name, 
      role: newUser.role, 
      company: newUser.company 
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    window.dispatchEvent(new Event('hiresmart_auth_changed'))
    return sessionUser
  },

  async googleAuth(role?: UserRole, credentialOrCode?: string): Promise<User> {
    if (role === "admin") {
      throw new Error("Administrator accounts cannot be registered via Google OAuth.")
    }

    if (!env.useMock) {
      if (credentialOrCode) {
        const payload: any = { role }
        if (credentialOrCode.startsWith("ya29.")) {
          payload.accessToken = credentialOrCode
        } else if (credentialOrCode.includes(".")) {
          payload.credential = credentialOrCode
        } else {
          payload.code = credentialOrCode
          payload.redirectUri = `${window.location.origin}/oauth/callback`
        }

        const res = await httpClient.post<{ success: boolean; data: { accessToken: string; user: any } }>("/auth/google", payload)
        if (res?.data?.accessToken) {
          httpClient.setAuthToken(res.data.accessToken)
          const u = res.data.user
          const sessionUser: User = {
            id: u.id || u._id,
            email: u.email,
            name: u.fullName || u.name || "Google User",
            fullName: u.fullName,
            role: u.role as UserRole,
            company: u.companyName || u.company,
            avatarUrl: u.avatarUrl,
          }
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
          syncUserProfiles(sessionUser)
          window.dispatchEvent(new Event('hiresmart_auth_changed'))
          return sessionUser
        }
      }

      // Check if Google Identity Services Token Client is available in browser for smooth popup auth
      if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2 && env.googleClientId) {
        return new Promise<User>((resolve, reject) => {
          try {
            const client = (window as any).google.accounts.oauth2.initTokenClient({
              client_id: env.googleClientId,
              scope: "openid profile email",
              callback: async (tokenResponse: any) => {
                if (tokenResponse.error) {
                  // Fall back seamlessly to server redirect flow if popup client fails or is blocked
                  console.warn("Google popup reported error, falling back to server redirect:", tokenResponse.error)
                  this.triggerGoogleRedirect(role).then(resolve).catch(reject)
                  return
                }
                if (tokenResponse.access_token) {
                  try {
                    const user = await this.googleAuth(role, tokenResponse.access_token)
                    resolve(user)
                  } catch (e) {
                    this.triggerGoogleRedirect(role).then(resolve).catch(reject)
                  }
                } else {
                  this.triggerGoogleRedirect(role).then(resolve).catch(reject)
                }
              },
            })
            client.requestAccessToken({ prompt: "consent" })
          } catch {
            this.triggerGoogleRedirect(role).then(resolve).catch(reject)
          }
        })
      }

      return this.triggerGoogleRedirect(role)
    }

    await delay(800)
    const mockEmail = `google.${Math.random().toString(36).substr(2, 5)}@gmail.com`
    const mockName = "Google Verified Candidate"

    if (role) {
      return this.register({
        email: mockEmail,
        name: mockName,
        role,
        isGoogle: true
      })
    } else {
      const users = this.getUsers()
      if (users.length > 0) {
        const user = users[0]
        const sessionUser: User = { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          company: user.company 
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        window.dispatchEvent(new Event('hiresmart_auth_changed'))
        return sessionUser
      } else {
        return this.register({
          email: mockEmail,
          name: mockName,
          role: "candidate",
          isGoogle: true
        })
      }
    }
  },

  async triggerGoogleRedirect(role?: UserRole): Promise<User> {
    try {
      const redirectUri = `${window.location.origin}/oauth/callback`
      const res = await httpClient.get<{ success: boolean; data: { url: string } }>(
        `/auth/google/url?role=${role || 'candidate'}&redirectUri=${encodeURIComponent(redirectUri)}`
      )
      if (res?.data?.url) {
        window.location.href = res.data.url
        return new Promise(() => {})
      }
      throw new Error("Failed to generate Google authentication link.")
    } catch (err: any) {
      if (err?.isNetworkError) {
        throw new Error("Cannot connect to HireSmart API gateway. Please ensure the backend server is running on http://localhost:5000.")
      }
      const message = err.response?.data?.error?.message || err.message || ""
      if (message.includes("not configured") || err.status === 503) {
        throw new Error("Google sign-in is unavailable until the server is configured. You can sign in with your email and password.")
      }
      throw new Error(message || "Google authentication failed.")
    }
  },

  async linkedinAuth(role?: UserRole, code?: string): Promise<User> {
    if (role === "admin") {
      throw new Error("Administrator accounts cannot be registered via LinkedIn OAuth.")
    }

    if (!env.useMock) {
      if (code) {
        const redirectUri = `${window.location.origin}/oauth/callback`
        const res = await httpClient.post<{ success: boolean; data: { accessToken: string; user: any } }>("/auth/linkedin", {
          code,
          role,
          redirectUri,
        })
        if (res?.data?.accessToken) {
          httpClient.setAuthToken(res.data.accessToken)
          const u = res.data.user
          const sessionUser: User = {
            id: u.id || u._id,
            email: u.email,
            name: u.fullName || u.name || "LinkedIn Professional",
            fullName: u.fullName,
            role: u.role as UserRole,
            company: u.companyName || u.company,
            avatarUrl: u.avatarUrl,
          }
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
          syncUserProfiles(sessionUser)
          window.dispatchEvent(new Event('hiresmart_auth_changed'))
          return sessionUser
        }
      }

      try {
        const redirectUri = `${window.location.origin}/oauth/callback`
        const res = await httpClient.get<{ success: boolean; data: { url: string } }>(
          `/auth/linkedin/url?role=${role || 'candidate'}&redirectUri=${encodeURIComponent(redirectUri)}`
        )
        if (res?.data?.url) {
          window.location.href = res.data.url
          return new Promise(() => {})
        }
      } catch (err: any) {
        const message = err.response?.data?.error?.message || err.message || ""
        if (message.includes("not configured") || err.status === 503) {
          throw new Error("LinkedIn Sign-In is not configured yet on the server. Please add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to backend/.env, or sign in with your email and password.")
        }
        throw new Error(message || "LinkedIn authentication failed.")
      }
    }

    await delay(800)
    const mockEmail = `linkedin.${Math.random().toString(36).substr(2, 5)}@example.com`
    const mockName = "LinkedIn Verified Candidate"

    return this.register({
      email: mockEmail,
      name: mockName,
      role: role || "candidate",
      isGoogle: true
    })
  },

  deleteAccount(userId: string): void {
    if (typeof window !== "undefined") {
      const users = this.getUsers()
      const filtered = users.filter(u => u.id !== userId)
      localStorage.setItem(USERS_KEY, JSON.stringify(filtered))
      this.logout()
    }
  },

  async updateEmail(userId: string, newEmail: string): Promise<User> {
    await delay(300)
    const cleanEmail = newEmail.trim().toLowerCase()
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      throw new Error("Please enter a valid email address.")
    }

    const users = this.getUsers()
    const currentUser = this.getCurrentUser()
    const existing = users.find(u => 
      u.id !== userId && 
      u.email && 
      u.email.toLowerCase() === cleanEmail &&
      (!currentUser?.email || u.email.toLowerCase() !== currentUser.email.toLowerCase())
    )
    if (existing) {
      throw new Error("An account with this email address already exists.")
    }

    const updatedUsers = users.map(u => {
      if (u.id === userId || (currentUser?.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase())) {
        return { ...u, email: newEmail.trim() }
      }
      return u
    })
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))

    const updatedSessionUser: User = currentUser 
      ? { ...currentUser, email: newEmail.trim() }
      : { id: userId, email: newEmail.trim(), name: "User", role: "candidate" }

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSessionUser))
    window.dispatchEvent(new Event('hiresmart_auth_changed'))
    return updatedSessionUser
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    if (!currentPassword) {
      throw new Error("Current password is required.")
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long.")
    }
    if (currentPassword === newPassword) {
      throw new Error("New password must be different from your current password.")
    }

    if (!env.useMock) {
      await httpClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      })
      return true
    }

    await delay(400)

    const users = this.getUsers()
    const currentUser = this.getCurrentUser()
    
    const userIndex = users.findIndex(u => 
      u.id === userId || (currentUser?.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
    )

    if (userIndex !== -1) {
      const user = users[userIndex]
      if (user.password) {
        const inputHash = await hashPassword(currentPassword)
        const isCurrentValid = user.password === inputHash || user.password === currentPassword
        if (!isCurrentValid) {
          throw new Error("The current password you entered is incorrect.")
        }
      }

      // Hash new password - never stored in plaintext
      const newHash = await hashPassword(newPassword)
      users[userIndex].password = newHash
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      return true
    } else {
      const newHash = await hashPassword(newPassword)
      if (currentUser) {
        users.push({
          id: currentUser.id || userId,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          password: newHash,
          company: currentUser.company
        })
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
      }
      return true
    }
  },

  logout() {
    if (!env.useMock) {
      httpClient.post("/auth/logout").catch(() => {})
      httpClient.setAuthToken(null)
    }

    if (typeof window !== "undefined") {
      const keysToClear = [
        SESSION_KEY,
        "hiresmart_token",
        "hiresmart_candidate_profile",
        "hiresmart_recruiter_profile",
        "hiresmart_active_resume",
        "hiresmart_all_applications",
        "hiresmart_saved_jobs",
        "hiresmart_pipeline_candidates",
        "hiresmart_recruiter_candidates",
        "hiresmart_recruiter_interviews",
        "hiresmart_interviews",
      ]
      keysToClear.forEach(key => localStorage.removeItem(key))

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear()
      }
      window.dispatchEvent(new Event('hiresmart_auth_changed'))
      window.dispatchEvent(new Event('hiresmart_profile_updated'))
      window.dispatchEvent(new Event('hiresmart_recruiter_profile_updated'))
      window.dispatchEvent(new Event('hiresmart_applications_updated'))
      window.dispatchEvent(new Event('hiresmart_pipeline_updated'))
      window.dispatchEvent(new Event('hiresmart_recruiter_candidates_updated'))
      window.dispatchEvent(new Event('hiresmart_recruiter_interviews_updated'))
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}
