"use client"

import { AuthProvider } from "@/context/auth-context"
import { LoginPage } from "@/components/login-page"

export default function Page() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}
