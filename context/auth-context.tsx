"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { UsersApi } from "@/api"

/** TypeScript interface for login credentials */
export interface UserLogin {
  email: string
  password: string
}

/** TypeScript interface for registration credentials */
export interface UserRegister {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  onLogin: (credentials: UserLogin) => Promise<void>
  onRegister: (credentials: UserRegister) => Promise<void>
  onLogout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing login session on mount
  useEffect(() => {
    const token = localStorage.getItem("skillshare_jwt")
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  /** Login via API */
  const onLogin = async (credentials: UserLogin): Promise<void> => {
    const api = new UsersApi()
    try {
      const response = await api.loginUser({
        username_or_email: credentials.email,
        password: credentials.password,
      })
      const token = response.data.access_token.replace(/^Bearer\\s+/i, "")
      localStorage.setItem("skillshare_jwt", token)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("[SkillShare Local] Login failed", error)
      localStorage.removeItem("skillshare_jwt")
      setIsAuthenticated(false)
      throw error
    }
  }

  /** Register via API, then login */
  const onRegister = async (credentials: UserRegister): Promise<void> => {
    const api = new UsersApi()
    try {
      await api.registerUser({
        first_name: credentials.firstName,
        last_name: credentials.lastName,
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      })

      const response = await api.loginUser({
        username_or_email: credentials.email,
        password: credentials.password,
      })
      const token = response.data.access_token.replace(/^Bearer\\s+/i, "")
      localStorage.setItem("skillshare_jwt", token)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("[SkillShare Local] Registration failed", error)
      localStorage.removeItem("skillshare_jwt")
      setIsAuthenticated(false)
      throw error
    }
  }

  const onLogout = () => {
    localStorage.removeItem("skillshare_jwt")
    setIsAuthenticated(false)
    console.log("[SkillShare Local] Logged out")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, onLogin, onRegister, onLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
