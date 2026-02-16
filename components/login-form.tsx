"use client"

import { useState, type FormEvent } from "react"
import { useAuth, type UserLogin, type UserRegister } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export function LoginForm() {
  const { onLogin, onRegister } = useAuth()

  // Toggle between login and signup mode
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [loginForm, setLoginForm] = useState<UserLogin>({
    email: "",
    password: "",
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState<UserRegister>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  })

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onLogin(loginForm)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onRegister(registerForm)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev)
    setShowPassword(false)
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5">
      {/* Header */}
      <CardHeader className="pb-4 text-center">
        {/* Brand mark */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BookOpen className="h-7 w-7" />
        </div>

        <CardTitle className="font-heading text-2xl tracking-tight text-foreground">
          {isRegisterMode ? "Create your account" : "Welcome back"}
        </CardTitle>

        <CardDescription className="text-muted-foreground">
          {isRegisterMode
            ? "Join your campus skill-sharing community"
            : "Sign in to SkillShare Local"}
        </CardDescription>
      </CardHeader>

      {/* Form */}
      <CardContent>
        {isRegisterMode ? (
          /* ──── Register Form ──── */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  required
                  value={registerForm.firstName}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  value={registerForm.lastName}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registerUsername" className="text-foreground">
                Username
              </Label>
              <Input
                id="registerUsername"
                type="text"
                placeholder="janedoe"
                required
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, username: e.target.value }))
                }
                className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registerEmail" className="text-foreground">
                Email
              </Label>
              <Input
                id="registerEmail"
                type="email"
                placeholder="jane@university.edu"
                required
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registerPassword" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="border-border bg-card pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* ──── Login Form ──── */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loginEmail" className="text-foreground">
                Email
              </Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="you@university.edu"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="loginPassword" className="text-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary transition-colors hover:text-primary/80"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="border-border bg-card pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-11 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      {/* Footer — toggle between login / register */}
      <CardFooter className="flex-col gap-4 pb-8">
        <div className="relative flex w-full items-center">
          <div className="flex-grow border-t border-border" />
          <span className="mx-3 text-xs text-muted-foreground">
            {isRegisterMode ? "Already have an account?" : "New to SkillShare Local?"}
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={toggleMode}
          className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
        >
          {isRegisterMode ? "Sign In Instead" : "Register"}
        </Button>
      </CardFooter>
    </Card>
  )
}

/** Shown when the user is already authenticated */
export function AuthenticatedView() {
  const { onLogout } = useAuth()

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <CardTitle className="font-heading text-2xl tracking-tight text-foreground">
          {"You're signed in!"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Welcome to SkillShare Local. Start exploring sessions on your campus.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button className="h-11 bg-primary text-primary-foreground hover:bg-primary/90">
          <Users className="h-4 w-4" />
          <span>Browse Sessions</span>
        </Button>
        <Button
          variant="outline"
          onClick={onLogout}
          className="h-11 border-border text-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
