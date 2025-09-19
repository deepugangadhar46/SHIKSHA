"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard"
import { AppProviders } from "@/components/providers/app-providers"
import { useAuth } from "@/contexts/auth-context"
import { PageTransition } from "@/components/animations/page-transition"

export default function TeacherPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?role=teacher')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <AppProviders>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <TeacherDashboard />
        </div>
      </div>
    </AppProviders>
  )
}
