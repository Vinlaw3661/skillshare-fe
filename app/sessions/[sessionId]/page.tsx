import { SessionDetailPage } from "@/components/session-detail-page"
import { BASE_PATH } from "@/api/base"
import type { SessionCreateResponse } from "@/api"

interface PageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params
  let initialSession: SessionCreateResponse | null = null
  let initialError: string | null = null

  try {
    const response = await fetch(`${BASE_PATH}/sessions/${sessionId}`, {
      cache: "no-store",
    })

    if (response.ok) {
      initialSession = (await response.json()) as SessionCreateResponse
    } else if (response.status === 404) {
      initialError = "Session not found."
    } else {
      initialError = `Unable to load session (status ${response.status}).`
    }
  } catch (error) {
    console.error("[SkillShare Local] Server fetch failed", error)
    initialError = "Unable to load this session."
  }

  return (
    <SessionDetailPage
      sessionId={sessionId}
      initialSession={initialSession}
      initialError={initialError}
    />
  )
}
