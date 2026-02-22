"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SessionsApi, Configuration } from "@/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Loader2, DollarSign } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { format, parse } from "date-fns"

// Helper functions to make the dates and times look pretty
function formatDate(dateStr: string) {
  try {
    return format(parse(dateStr, "yyyy-MM-dd", new Date()), "EEEE, MMMM d, yyyy")
  } catch {
    return dateStr
  }
}

function formatTime(timeStr: string) {
  try {
    return format(parse(timeStr, "HH:mm", new Date()), "h:mm a")
  } catch {
    return timeStr
  }
}

export default function SessionDetail() {
  // 1. Get the session ID from the URL (e.g., /sessions/123 -> id = "123")
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // 2. State to hold the specific session data
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // 3. Fetch the data for this specific ID when the page loads
  useEffect(() => {
    if (!id) return

    const fetchSessionDetail = async () => {
      try {
        const apiConfig = new Configuration({
          basePath: "https://skillshare-app-drgr4.ondigitalocean.app",
          accessToken: () => localStorage.getItem("skillshare_jwt") || "",
        })
        const sessionsApi = new SessionsApi(apiConfig)

        // Ask the backend for ONLY the session with this ID
        const response = await sessionsApi.getSession(id)
        setSession(response.data)
      } catch (err: any) {
        console.error("Failed to fetch session:", err)
        setError("Could not load session details. It may have been deleted or you might be offline.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionDetail()
  }, [id])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" aria-hidden="true" />
            Back to Browse
          </Link>
        </Button>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-xl border bg-card shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading session details...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-24 rounded-xl border border-destructive/20 bg-destructive/5 shadow-sm">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/")}>Return Home</Button>
          </div>
        ) : session ? (
          /* Success State - Show the Data */
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm font-medium">
                  {session.skill_category}
                </Badge>
                {session.status && (
                  <Badge variant="outline" className="text-sm">
                    {session.status}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {session.title}
              </h1>
            </div>

            <Card className="shadow-sm border-border/60">
              <CardContent className="p-6 sm:p-8 space-y-8">

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">About this session</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {session.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-muted/50 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Date</p>
                        <p className="text-sm">{formatDate(session.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Time</p>
                        <p className="text-sm">{formatTime(session.start_time)} &ndash; {formatTime(session.end_time)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Location</p>
                        <p className="text-sm">{session.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Availability</p>
                        <p className="text-sm">{session.enrolled_count} / {session.capacity} spots filled</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / CTA Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">
                      {session.price === 0 ? "Free" : `$${session.price.toFixed(2)}`}
                    </span>
                  </div>

                  <Button size="lg" className="w-full sm:w-auto px-8" disabled={session.enrolled_count >= session.capacity}>
                    {session.enrolled_count >= session.capacity ? "Session Full" : "Enroll Now"}
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  )
}