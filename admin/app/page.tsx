"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { useAppContext } from "@/context/app-context"
import LoadingScreen from "@/components/loading-screen"

export default function Home() {
  const router = useRouter()
  const { user } = useAppContext()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Short timeout to ensure context is fully loaded
    const timer = setTimeout(() => {
      if (user) {
        router.push("/adminwaste")
      } else {
        setIsLoading(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [user, router])

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Waste Classification</h1>
          <p className="mt-2 text-sm text-gray-600">Admin Dashboard</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
