"use client"

import { useState } from "react"
import { Configuration, SessionsApi, type SessionCreateRequest } from "@/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CalendarDays,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  Users,
  Copy,
} from "lucide-react"

const categoryOptions = [
  "Career",
  "Study Skills",
  "Tech",
  "Design",
  "Wellness",
  "Languages",
  "Creative",
]

const initialForm: SessionCreateRequest = {
  title: "",
  description: "",
  skill_category: "",
  location: "",
  start_time: "",
  end_time: "",
  capacity: 12,
  price: 0,
}

export function CreateSessionPage() {
  const [form, setForm] = useState<SessionCreateRequest>(initialForm)
  const [sessionDate, setSessionDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusTone, setStatusTone] = useState<"success" | "error">("success")
  const [createdSessionUrl, setCreatedSessionUrl] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  const updateField = <K extends keyof SessionCreateRequest>(
    key: K,
    value: SessionCreateRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const normalizeTime = (value: string) => {
    if (!value) return value
    return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value
  }

  const toDateTime = (date: string, time: string) => {
    if (!date || !time) return time
    if (time.includes("T")) return time
    const normalizedTime = normalizeTime(time)
    const localDate = new Date(`${date}T${normalizedTime}`)
    if (Number.isNaN(localDate.getTime())) {
      return `${date}T${normalizedTime}`
    }

    const offsetMinutes = -localDate.getTimezoneOffset()
    const sign = offsetMinutes >= 0 ? "+" : "-"
    const absMinutes = Math.abs(offsetMinutes)
    const offsetHours = String(Math.floor(absMinutes / 60)).padStart(2, "0")
    const offsetRemainder = String(absMinutes % 60).padStart(2, "0")

    return `${date}T${normalizedTime}${sign}${offsetHours}:${offsetRemainder}`
  }

  const extractErrorMessage = (error: unknown) => {
    if (error && typeof error === "object") {
      const maybeAxios = error as {
        response?: { data?: any; status?: number }
        message?: string
      }
      const data = maybeAxios.response?.data

      if (typeof data === "string") return data

      if (data?.detail && Array.isArray(data.detail)) {
        const detailMessages = data.detail
          .map((item: any) => item?.msg ?? item?.message)
          .filter(Boolean)
        if (detailMessages.length > 0) return detailMessages.join(" ")
      }

      if (typeof data?.message === "string") return data.message
      if (typeof maybeAxios.message === "string") return maybeAxios.message
    }

    return "Unable to publish the session. Please try again."
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)
    setStatusTone("success")
    setCreatedSessionUrl(null)
    setIsCopied(false)
    setCopyError(null)

    if (!form.skill_category) {
      setStatusTone("error")
      setStatusMessage("Please choose a skill category before publishing.")
      return
    }

    if (!sessionDate) {
      setStatusTone("error")
      setStatusMessage("Please select a session date before publishing.")
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("skillshare_jwt")
      if (!token) {
        setStatusTone("error")
        setStatusMessage("Please sign in before creating a session.")
        return
      }

      const api = new SessionsApi(
        new Configuration({
          accessToken: token,
        })
      )

      const payload: SessionCreateRequest = {
        ...form,
        start_time: toDateTime(sessionDate, form.start_time),
        end_time: toDateTime(sessionDate, form.end_time),
        capacity: Number.isFinite(form.capacity) ? form.capacity : 0,
        price: Number.isFinite(form.price) ? form.price : 0,
      }

      const response = await api.createSession(payload)
      const sessionId = response.data.id
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      setCreatedSessionUrl(`${origin}/sessions/${sessionId}`)
      setStatusMessage("Session created. Share the link with classmates.")
      setCopyError(null)
    } catch (error) {
      console.error(
        "[SkillShare Local] Failed to create session",
        error,
        (error as any)?.response?.data
      )
      setStatusTone("error")
      setStatusMessage(extractErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-svh bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-8 h-96 w-96 rounded-full bg-primary/10" />
        <div className="absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full bg-accent/60" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Host a session</p>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Create a new skill-sharing session
              </h1>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Set the basics and publish when you are ready. Sessions appear immediately to
            students on campus.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
          <Card className="border-border/60 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Session details</CardTitle>
              <CardDescription>Tell students what they will learn and when to show up.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="title" className="text-foreground">
                    Session title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Resume review for internship season"
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Share what attendees will practice, bring, or prepare."
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="category" className="text-foreground">
                      Skill category
                    </Label>
                    <Select
                      value={form.skill_category}
                      onValueChange={(value) => updateField("skill_category", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Pick a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="location" className="text-foreground">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="Sears 318"
                      value={form.location}
                      onChange={(event) => updateField("location", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="date" className="text-foreground">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={sessionDate}
                      onChange={(event) => setSessionDate(event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="start_time" className="text-foreground">
                      Start time
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={form.start_time}
                      onChange={(event) => updateField("start_time", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="end_time" className="text-foreground">
                      End time
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={form.end_time}
                      onChange={(event) => updateField("end_time", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="capacity" className="text-foreground">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={(event) =>
                        updateField("capacity", Number(event.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="price" className="text-foreground">
                      Price (USD)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(event) => updateField("price", Number(event.target.value) || 0)}
                      required
                    />
                    <span className="text-xs text-muted-foreground">Set 0 for free sessions.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish session</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {statusMessage ? (
                    <div className="flex w-full flex-col gap-2 text-sm">
                      <span
                        className={
                          statusTone === "success"
                            ? "text-primary"
                            : "text-destructive"
                        }
                      >
                        {statusMessage}
                      </span>
                      {createdSessionUrl ? (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                          <a
                            href={createdSessionUrl}
                            className="break-all text-primary underline-offset-4 hover:underline"
                          >
                            {createdSessionUrl}
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={async () => {
                              try {
                                setCopyError(null)
                                const canUseClipboard =
                                  typeof navigator !== "undefined" &&
                                  !!navigator.clipboard?.writeText &&
                                  typeof window !== "undefined" &&
                                  window.isSecureContext

                                if (canUseClipboard) {
                                  await navigator.clipboard.writeText(createdSessionUrl)
                                  setIsCopied(true)
                                  setTimeout(() => setIsCopied(false), 2000)
                                  return
                                }

                                if (typeof document !== "undefined") {
                                  const textarea = document.createElement("textarea")
                                  textarea.value = createdSessionUrl
                                  textarea.setAttribute("readonly", "")
                                  textarea.style.position = "absolute"
                                  textarea.style.left = "-9999px"
                                  document.body.appendChild(textarea)
                                  textarea.select()
                                  const copied = document.execCommand("copy")
                                  document.body.removeChild(textarea)
                                  if (copied) {
                                    setIsCopied(true)
                                    setTimeout(() => setIsCopied(false), 2000)
                                    return
                                  }
                                }

                                setCopyError(
                                  "Copy is not supported here. Please copy the link manually."
                                )
                              } catch (copyError) {
                                console.error(
                                  "[SkillShare Local] Failed to copy session link",
                                  copyError
                                )
                                setCopyError(
                                  "Copy is not available. Please copy the link manually."
                                )
                              }
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>{isCopied ? "Copied" : "Copy"}</span>
                          </Button>
                          {copyError ? (
                            <span className="text-xs text-destructive">{copyError}</span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>All times shown in local campus time.</span>
              <span>Only authenticated students can RSVP.</span>
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">Session snapshot</CardTitle>
                <CardDescription>Quick preview of what attendees will see.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="text-lg font-semibold text-foreground">
                    {form.title || "Untitled session"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{form.skill_category || "Category"}</Badge>
                  <Badge variant="outline">
                    {form.price > 0 ? `$${form.price.toFixed(2)}` : "Free"}
                  </Badge>
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{sessionDate || "Date"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{form.capacity} seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{form.location || "Location"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{form.price > 0 ? `${form.price} per seat` : "No cost"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">Hosting tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Pick a clear outcome so attendees know what they will leave with.</p>
                <p>Share prep requirements early (materials, prior knowledge, or downloads).</p>
                <p>Cap sessions based on room size and how hands-on the activity is.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
