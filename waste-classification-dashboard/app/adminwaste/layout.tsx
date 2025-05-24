"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { useAppContext } from "@/context/app-context"
import LoadingScreen from "@/components/loading-screen"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAppContext()
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    // Short timeout to ensure context is fully loaded
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/")
      } else {
        setIsLoading(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [user, router])

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  // If no user after loading, don't render anything (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
