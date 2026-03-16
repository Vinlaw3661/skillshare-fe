"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Configuration,
  EnrollmentsApi,
  UsersApi,
  type UserCreateResponse,
  type EnrollmentResponse,
} from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  UserRound,
  X,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

export function ProfilePage() {
  const [user, setUser] = useState<UserCreateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Edit profile
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", bio: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Enrollments
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([])
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming")
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      const token = localStorage.getItem("skillshare_jwt")
      if (!token) {
        if (isActive) {
          setErrorMessage("Please sign in to view your profile.")
          setIsLoading(false)
        }
        return
      }

      try {
        const config = new Configuration({ accessToken: token })
        const [userRes, enrollRes] = await Promise.all([
          new UsersApi(config).getUser(),
          new EnrollmentsApi(config).getMyEnrollmentsEnrollmentsMyEnrollmentsGet("all"),
        ])
        if (isActive) {
          setUser(userRes.data)
          setEditForm({
            firstName: userRes.data.first_name,
            lastName: userRes.data.last_name,
            bio: userRes.data.bio ?? "",
          })
          setEnrollments(enrollRes.data as unknown as EnrollmentResponse[])
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            (error as any)?.response?.data?.detail?.[0]?.msg ??
              (error as any)?.response?.data?.message ??
              "Unable to load your profile."
          )
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
          setIsLoadingEnrollments(false)
        }
      }
    }

    loadProfile()
    return () => {
      isActive = false
    }
  }, [])

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

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed)
  }

  const handleSignOut = () => {
    localStorage.removeItem("skillshare_jwt")
    window.location.href = "/"
  }

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("skillshare_jwt")
    if (!token) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const response = await new UsersApi(new Configuration({ accessToken: token })).updateUser({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        bio: editForm.bio,
      })
      setUser(response.data)
      setIsEditing(false)
      setSaveMessage("Profile updated.")
    } catch (error) {
      setSaveMessage(
        (error as any)?.response?.data?.detail?.[0]?.msg ??
          (error as any)?.response?.data?.message ??
          "Unable to save changes."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEnrollment = async (sessionId: string) => {
    const token = localStorage.getItem("skillshare_jwt")
    if (!token) return
    setCancellingId(sessionId)
    try {
      await new EnrollmentsApi(
        new Configuration({ accessToken: token })
      ).cancelEnrollmentEnrollmentsSessionsSessionIdEnrollDelete(sessionId)
      setEnrollments((prev) =>
        prev.map((e) =>
          e.session_id === sessionId ? { ...e, status: "cancelled" } : e
        )
      )
    } catch {
      // non-fatal
    } finally {
      setCancellingId(null)
    }
  }

  const now = new Date()

  const upcomingEnrollments = enrollments.filter(
    (e) => e.status === "enrolled" && new Date(e.session_start_time) > now
  )
  const pastEnrollments = enrollments.filter(
    (e) => new Date(e.session_start_time) <= now && e.status !== "cancelled"
  )
  const cancelledEnrollments = enrollments.filter((e) => e.status === "cancelled")

  const tabEnrollments =
    activeTab === "upcoming"
      ? upcomingEnrollments
      : activeTab === "past"
        ? pastEnrollments
        : cancelledEnrollments

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
            <CardDescription>{errorMessage ?? "We couldn't load your profile."}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sessions">Browse sessions</Link>
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

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Profile
          </Badge>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    firstName: user.first_name,
                    lastName: user.last_name,
                    bio: user.bio ?? "",
                  })
                  setSaveMessage(null)
                  setIsEditing(true)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </Button>
            )}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Account details */}
          <Card className="border-border/60 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Account details</CardTitle>
              <CardDescription>
                {isEditing ? "Update your profile information." : "Your SkillShare Local profile."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {isEditing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell classmates a little about yourself."
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="min-h-[96px]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                  {saveMessage && (
                    <p className="text-sm text-destructive">{saveMessage}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Member since</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(user.date_joined)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground">Bio</p>
                    <p className="text-sm text-muted-foreground">
                      {user.bio?.trim() ? user.bio : "No bio added yet."}
                    </p>
                  </div>
                  {saveMessage && (
                    <p className="text-sm text-primary">{saveMessage}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="flex flex-col gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">Quick actions</CardTitle>
                <CardDescription>Keep exploring the community.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button
                  asChild
                  className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/sessions">
                    <span>Browse sessions</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11"
                >
                  <Link href="/sessions/create">
                    <span>Create a session</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="h-11" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My enrollments */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
              My enrollments
            </h2>
            <p className="text-sm text-muted-foreground">Sessions you've signed up for.</p>
          </div>

          {/* Summary stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Upcoming", count: upcomingEnrollments.length },
              { label: "Past", count: pastEnrollments.length },
              { label: "Cancelled", count: cancelledEnrollments.length },
            ].map(({ label, count }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-foreground">{count}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {(["upcoming", "past", "cancelled"] as const).map((tab) => (
              <Button
                key={tab}
                type="button"
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          {/* Enrollment list */}
          {isLoadingEnrollments ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading enrollments...
            </div>
          ) : tabEnrollments.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {activeTab === "upcoming"
                  ? "No upcoming sessions. Browse and enroll in something new."
                  : activeTab === "past"
                    ? "No past sessions yet."
                    : "No cancelled enrollments."}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {tabEnrollments.map((enrollment) => {
                const isPast = new Date(enrollment.session_start_time) <= now
                return (
                  <Card key={enrollment.id} className="border-border/60">
                    <CardContent className="flex flex-wrap items-start justify-between gap-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={`/sessions/${enrollment.session_id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {enrollment.session_title}
                        </Link>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDateTime(enrollment.session_start_time)}
                          </span>
                          {enrollment.session_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {enrollment.session_location}
                            </span>
                          )}
                          {enrollment.host_name && (
                            <span className="flex items-center gap-1">
                              <UserRound className="h-3.5 w-3.5" />
                              {enrollment.host_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Enrolled{" "}
                            {new Intl.DateTimeFormat(undefined, {
                              month: "short",
                              day: "numeric",
                            }).format(new Date(enrollment.enrolled_at))}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {enrollment.status === "cancelled" ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Cancelled
                          </Badge>
                        ) : isPast ? (
                          <Badge variant="secondary">Completed</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelEnrollment(enrollment.session_id)}
                            disabled={cancellingId === enrollment.session_id}
                          >
                            {cancellingId === enrollment.session_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Cancel"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
