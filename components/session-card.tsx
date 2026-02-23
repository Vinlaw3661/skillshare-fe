import Link from "next/link"
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SessionCreateResponse } from "@/api"
import { format, parseISO } from "date-fns"

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-primary/10 text-primary border-primary/20",
  Arts: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  Music: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Cooking: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Academics: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  Fitness: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Languages: "bg-sky-500/10 text-sky-700 border-sky-500/20",
}

function formatDate(dateStr: string) {
  const parsed = parseISO(dateStr)
  return Number.isNaN(parsed.getTime()) ? dateStr : format(parsed, "EEE, MMM d, yyyy")
}

function formatTime(timeStr: string) {
  const parsed = parseISO(timeStr)
  return Number.isNaN(parsed.getTime()) ? timeStr : format(parsed, "h:mm a")
}

interface SessionCardProps {
  session: SessionCreateResponse
}

export function SessionCard({ session }: SessionCardProps) {
  const isFull = session.enrolled_count >= session.capacity
  const spotsLeft = Math.max(session.capacity - session.enrolled_count, 0)
  const categoryClass =
    CATEGORY_COLORS[session.skill_category] ??
    "bg-secondary text-secondary-foreground border-border"

  return (
    <Card className="group flex flex-col justify-between overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-snug font-bold text-balance">
            {session.title}
          </CardTitle>
          <Badge variant="outline" className={`shrink-0 text-xs ${categoryClass}`}>
            {session.skill_category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={15} className="shrink-0 text-primary" aria-hidden="true" />
          <span>{formatDate(session.start_time)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={15} className="shrink-0 text-primary" aria-hidden="true" />
          <span>
            {formatTime(session.start_time)} &ndash; {formatTime(session.end_time)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={15} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{session.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={15} className="shrink-0 text-primary" aria-hidden="true" />
          <span>
            {session.enrolled_count} / {session.capacity} spots filled
          </span>
          {isFull ? (
            <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
              Full
            </Badge>
          ) : spotsLeft <= 3 ? (
            <span className="ml-auto text-[11px] font-medium text-amber-600">
              {spotsLeft} left
            </span>
          ) : null}
        </div>

        <div className="pt-1">
          {session.price === 0 ? (
            <span className="text-sm font-semibold text-emerald-600">Free</span>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              ${session.price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full group/btn" size="default" disabled={isFull}>
          <Link href={`/sessions/${session.id}`}>
            <span>View Details</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover/btn:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
