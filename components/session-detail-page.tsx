"use client"

import { useEffect, useState } from "react"
import { SessionsApi, type SessionCreateResponse } from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  Clock,
  DollarSign,
  MapPin,
  Users,
  UserRound,
  ArrowRight,
  Loader2,
} from "lucide-react"

interface SessionDetailPageProps {
  sessionId: string
  initialSession?: SessionCreateResponse | null
  initialError?: string | null
}

export function SessionDetailPage({
  sessionId,
  initialSession = null,
  initialError = null,
}: SessionDetailPageProps) {
  const [session, setSession] = useState<SessionCreateResponse | null>(initialSession)
  const [isLoading, setIsLoading] = useState(!initialSession && !initialError)
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError)

  useEffect(() => {
    let isActive = true
    const api = new SessionsApi()

    const fetchSession = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await api.getSession(sessionId)
        console.log("[SkillShare Local] Session response:", response.data)
        if (isActive) {
          setSession(response.data)
        }
      } catch (error) {
        console.error("[SkillShare Local] Failed to load session", error)
        if (isActive) {
          const message =
            (error as any)?.response?.data?.detail?.[0]?.msg ??
            (error as any)?.response?.data?.message ??
            "Unable to load this session."
          setErrorMessage(message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    if (!sessionId) {
      setErrorMessage("Missing session ID.")
      setIsLoading(false)
      return () => {
        isActive = false
      }
    }

    if (!initialSession && !initialError) {
      fetchSession()
    }

    return () => {
      isActive = false
    }
  }, [sessionId, initialSession, initialError])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border/60">
          <CardHeader>
            <CardTitle className="text-xl">Session unavailable</CardTitle>
            <CardDescription>
              {errorMessage ?? "We could not find that session."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const seatsLeft = Math.max(session.capacity - session.enrolled_count, 0)
  const fillPercent = Math.min(
    100,
    Math.round((session.enrolled_count / session.capacity) * 100)
  )

  const formatDate = (value: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parsed)
  }

  const formatTime = (value: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed)
  }

  const formatTimeRange = (start: string, end: string) => {
    const startLabel = formatTime(start)
    const endLabel = formatTime(end)
    if (!startLabel && !endLabel) return ""
    return `${startLabel} - ${endLabel}`
  }

  return (
    <div className="relative min-h-svh bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10" />
        <div className="absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/60" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{session.skill_category}</Badge>
            <Badge variant={session.status === "Open" ? "default" : "outline"}>
              {session.status}
            </Badge>
            <span className="text-xs text-muted-foreground">Session ID: {session.id}</span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {session.title}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{session.description}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Session details</CardTitle>
              <CardDescription>Everything attendees need to know at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.start_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeRange(session.start_time, session.end_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{session.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Price</p>
                    <p className="text-sm text-muted-foreground">
                      {session.price > 0 ? `$${session.price}` : "Free"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {session.enrolled_count}/{session.capacity} enrolled
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Host</p>
                    <p className="text-sm text-muted-foreground">Host ID: {session.host_id}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seats left</span>
                  <span className="font-medium text-foreground">{seatsLeft}</span>
                </div>
                <Progress value={fillPercent} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">Ready to join?</CardTitle>
                <CardDescription>Secure your spot and add it to your calendar.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button className="h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                  <span>Enroll in session</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-11">
                  Message host
                </Button>
                <p className="text-xs text-muted-foreground">
                  Enrollment closes once capacity is reached.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">What to bring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Bring a digital copy of your resume and one target job listing.</p>
                <p>Optional: laptop, printed resume, and a notebook.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
