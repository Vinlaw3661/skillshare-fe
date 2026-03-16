"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UsersApi, type UserCreateResponse } from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CalendarDays, Loader2, UserRound } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface UserProfilePageProps {
  userId: string
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const [user, setUser] = useState<UserCreateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    new UsersApi()
      .getUserById(userId)
      .then((r) => {
        if (isActive) setUser(r.data)
      })
      .catch((error) => {
        if (isActive) {
          setErrorMessage(
            (error as any)?.response?.data?.detail?.[0]?.msg ??
              (error as any)?.response?.data?.message ??
              "Unable to load this profile."
          )
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [userId])

  const formatDate = (value?: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(parsed)
  }

  if (isLoading) {
    return (
      <div className="min-h-svh bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !user) {
    return (
      <div className="min-h-svh bg-background">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-32">
          <Card className="w-full max-w-md border-border/60">
            <CardHeader>
              <CardTitle className="text-xl">Profile unavailable</CardTitle>
              <CardDescription>{errorMessage ?? "We couldn't find that profile."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sessions">Back to sessions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-svh bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-12 h-96 w-96 rounded-full bg-primary/10" />
        <div className="absolute -bottom-52 right-0 h-[32rem] w-[32rem] rounded-full bg-accent/60" />
      </div>

      <Navbar />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/sessions"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All sessions
        </Link>

        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Student profile
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </header>

        <Card className="border-border/60 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="font-heading text-xl">About</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Member since</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.date_joined)}</p>
              </div>
            </div>
            {user.bio?.trim() && (
              <div>
                <p className="text-sm font-medium text-foreground">Bio</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{user.bio}</p>
              </div>
            )}
            <div className="pt-2">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/sessions">Browse their sessions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
