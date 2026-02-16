"use client"

import { useAuth } from "@/context/auth-context"
import { LoginForm, AuthenticatedView } from "@/components/login-form"
import { BookOpen, Lightbulb, Users, Calendar } from "lucide-react"

const features = [
  { icon: Lightbulb, text: "Learn from peers on campus" },
  { icon: Users, text: "Teach skills you're passionate about" },
  { icon: Calendar, text: "Flexible scheduling that fits your life" },
]

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      {/* Subtle decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5" />
        <div className="absolute -bottom-48 -right-48 h-[32rem] w-[32rem] rounded-full bg-accent/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        {/* Brand header */}
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              SkillShare Local
            </h1>
          </div>
          <p className="max-w-xs text-balance text-sm leading-relaxed text-muted-foreground">
            Your campus community for learning and teaching real-world skills
          </p>
        </header>

        {/* Login / Register card */}
        {isAuthenticated ? <AuthenticatedView /> : <LoginForm />}

        {/* Feature highlights */}
        <div className="flex flex-col gap-3">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground">
          <p>A CSDS 393 Project — Case Western Reserve University</p>
        </footer>
      </div>
    </div>
  )
}
