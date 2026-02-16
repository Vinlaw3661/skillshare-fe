"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

  // Check for existing login session on mount (mock behavior)
  useEffect(() => {
    const token = localStorage.getItem("skillshare_jwt")
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  /** Placeholder login — logs credentials and simulates JWT storage */
  const onLogin = async (credentials: UserLogin): Promise<void> => {
    console.log("[SkillShare Local] Login attempt:", {
      email: credentials.email,
      password: credentials.password,
    })

    // Simulate an API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simulate storing a JWT token
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ email: credentials.email, exp: Date.now() + 3600000 })
    )}.mock_signature`

    localStorage.setItem("skillshare_jwt", mockToken)
    setIsAuthenticated(true)
    console.log("[SkillShare Local] JWT stored successfully")
  }

  /** Placeholder register — logs credentials and simulates account creation */
  const onRegister = async (credentials: UserRegister): Promise<void> => {
    console.log("[SkillShare Local] Register attempt:", {
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      username: credentials.username,
    })

    // Simulate an API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate storing a JWT token after registration
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ email: credentials.email, exp: Date.now() + 3600000 })
    )}.mock_signature`

    localStorage.setItem("skillshare_jwt", mockToken)
    setIsAuthenticated(true)
    console.log("[SkillShare Local] Account created and JWT stored")
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
