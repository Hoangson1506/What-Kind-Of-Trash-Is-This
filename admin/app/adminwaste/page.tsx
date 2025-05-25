"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/app-context"
import LoadingScreen from "@/components/loading-screen"

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAppContext()

  useEffect(() => {
    // Redirect to model management as default page
    if (user) {
      router.push("/adminwaste/model-management")
    }
  }, [router, user])

  return <LoadingScreen message="Redirecting to dashboard..." />
}
