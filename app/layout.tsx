import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/components/providers/app-providers"
import { AccessibilityToolbar } from "@/components/accessibility/accessibility-toolbar"
import { CelebrationSystem } from "@/components/gamification/celebration-system"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "SHIKSHA - Gamified Learning for Rural Students",
  description:
    "Interactive learning platform designed for rural students in Odisha with cultural relevance and accessibility features",
  generator: "v0.app",
  manifest: "/manifest.json",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ef4444',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AppProviders>
          <Suspense fallback={null}>
            {children}
            <AccessibilityToolbar />
            <CelebrationSystem />
          </Suspense>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
