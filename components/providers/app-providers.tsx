"use client"

import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { GameProvider } from "@/contexts/game-context"
import { LanguageProvider } from "@/contexts/language-context"
import { AccessibilityProvider } from "@/contexts/accessibility-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ServiceWorkerProvider } from "./service-worker-provider"

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ServiceWorkerProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <AccessibilityProvider>
          <LanguageProvider>
            <AuthProvider>
              <GameProvider>{children}</GameProvider>
            </AuthProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ServiceWorkerProvider>
  )
}
