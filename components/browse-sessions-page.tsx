"use client"

import { useEffect, useMemo, useState } from "react"
import { SessionsApi, type SessionCreateResponse } from "@/api"
import { SessionCard } from "@/components/session-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCcw, Search } from "lucide-react"

const extractErrorMessage = (error: unknown) => {
  const anyError = error as any
  if (anyError?.response?.data?.detail?.[0]?.msg) {
    return anyError.response.data.detail[0].msg as string
  }
  if (typeof anyError?.response?.data?.message === "string") {
    return anyError.response.data.message
  }
  if (typeof anyError?.message === "string") {
    return anyError.message
  }
  return "Unable to load sessions."
}

export function BrowseSessionsPage() {
  const [sessions, setSessions] = useState<SessionCreateResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const loadSessions = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const api = new SessionsApi()
      const response = await api.listSessions()
      setSessions(response.data)
    } catch (error) {
      console.error("[SkillShare Local] Failed to load sessions", error)
      setErrorMessage(extractErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true

    const load = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const api = new SessionsApi()
        const response = await api.listSessions()
        if (isActive) {
          setSessions(response.data)
        }
      } catch (error) {
        console.error("[SkillShare Local] Failed to load sessions", error)
        if (isActive) {
          setErrorMessage(extractErrorMessage(error))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [])

  const categories = useMemo(() => {
    const unique = new Set(sessions.map((session) => session.skill_category))
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [sessions])

  const filteredSessions = useMemo(() => {
    const q = query.toLowerCase().trim()
    return sessions
      .filter((session) => {
        const matchesCategory = selectedCategory
          ? session.skill_category === selectedCategory
          : true
        const matchesSearch = q
          ? session.title.toLowerCase().includes(q) ||
            session.description.toLowerCase().includes(q)
          : true
        return matchesCategory && matchesSearch
      })
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
  }, [sessions, query, selectedCategory])

  const resultCount = filteredSessions.length

  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Campus Sessions
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Browse Sessions
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Discover skill-sharing sessions taught by students at your university.
            Search by topic or filter by category to find your next learning adventure.
          </p>
        </header>

        <section className="flex flex-col gap-4" aria-label="Search and filters">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sessions by title or description"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={selectedCategory ? "outline" : "default"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {errorMessage ? (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Unable to load sessions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={loadSessions}
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {resultCount} {resultCount === 1 ? "session" : "sessions"} found
            </span>
            {(query || selectedCategory) && (
              <button
                onClick={() => {
                  setQuery("")
                  setSelectedCategory(null)
                }}
                className="text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={`session-skeleton-${index}`}
                className="flex flex-col gap-4 border-border/60 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-9 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredSessions.length === 0 && !errorMessage ? (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">No sessions found</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Try a different search term or clear your filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
