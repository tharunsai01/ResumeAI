export type UserRole = "candidate" | "recruiter" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  company?: string // Optional, for recruiters
}

const USERS_KEY = "hiresmart_users"
const SESSION_KEY = "hiresmart_session"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

  async login(email: string, password: string):Promise<User> {
    await delay(800) // Mock network delay

    // Hardcode an admin login for testing the frontend admin portal
    if (email === "admin@hiresmart.ai" || email === "admin") {
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

    const users = this.getUsers()
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error("Invalid email or password.")
    
    const sessionUser: User = { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    window.dispatchEvent(new Event('hiresmart_auth_changed'))
    return sessionUser
  },

  async register(data: { email: string; password?: string; name: string; role: UserRole; company?: string; isGoogle?: boolean }): Promise<User> {
    await delay(800)
    const users = this.getUsers()
    
    if (users.find(u => u.email === data.email)) {
      throw new Error("An account with this email already exists.")
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      password: data.password || null,
      name: data.name,
      role: data.role,
      company: data.company,
      isGoogle: !!data.isGoogle
    }

    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const sessionUser: User = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, company: newUser.company }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    window.dispatchEvent(new Event('hiresmart_auth_changed'))
    return sessionUser
  },

  async googleAuth(role?: UserRole): Promise<User> {
    await delay(1200) // Mock popup delay
    
    // In a real app, this would open a Google OAuth popup, get the token, and send it to the backend.
    // For this mock, we will generate a random Google user or log them into a mock account.
    
    const mockEmail = `google.${Math.random().toString(36).substr(2, 5)}@gmail.com`
    const mockName = "Google User"

    // If role is provided, it's a registration flow via Google. 
    // If not, it's a login flow.
    if (role) {
      return this.register({
        email: mockEmail,
        name: mockName,
        role,
        isGoogle: true
      })
    } else {
      // For mock login purposes without a role specified (Login screen), 
      // just pick the first user or throw an error.
      const users = this.getUsers()
      if (users.length > 0) {
        const user = users[0] // Just log into the first available account for demo purposes
        const sessionUser: User = { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        window.dispatchEvent(new Event('hiresmart_auth_changed'))
        return sessionUser
      } else {
        // If no users exist, create a mock candidate to demonstrate
        return this.register({
          email: mockEmail,
          name: mockName,
          role: "candidate",
          isGoogle: true
        })
      }
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('hiresmart_auth_changed'))
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}
