"use client"

import { use } from "react"
import { UserProfilePage } from "@/components/user-profile-page"

interface PageProps {
  params: Promise<{ userId: string }>
}

export default function Page({ params }: PageProps) {
  const { userId } = use(params)
  return <UserProfilePage userId={userId} />
}
