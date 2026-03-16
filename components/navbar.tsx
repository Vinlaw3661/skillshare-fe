"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isAuthed, setIsAuthed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("skillshare_jwt"))
  }, [pathname])

  const handleSignOut = () => {
    localStorage.removeItem("skillshare_jwt")
    window.location.href = "/"
  }

  return (
    <nav className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            SkillShare Local
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sessions">Browse</Link>
          </Button>
          {isAuthed ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sessions/create">Host</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="ml-1">
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="ml-1">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
