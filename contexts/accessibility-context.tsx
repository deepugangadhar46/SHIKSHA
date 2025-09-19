"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  voiceEnabled: boolean
  keyboardNavigation: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (updates: Partial<AccessibilitySettings>) => void
  speak: (text: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    voiceEnabled: true, // Default enabled for rural students
    keyboardNavigation: true,
  })

  useEffect(() => {
    const savedSettings = localStorage.getItem("shiksha-accessibility")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Check system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches

    if (prefersReducedMotion || prefersHighContrast) {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("shiksha-accessibility", JSON.stringify(settings))

    // Apply CSS classes based on settings
    const root = document.documentElement
    root.classList.toggle("reduced-motion", settings.reducedMotion)
    root.classList.toggle("high-contrast", settings.highContrast)
    root.classList.toggle("large-text", settings.largeText)
  }, [settings])

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const speak = (text: string) => {
    if (!settings.voiceEnabled || !("speechSynthesis" in window)) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8 // Slower for better comprehension
    utterance.pitch = 1
    utterance.volume = 0.8

    // Try to use Hindi or English voice
    const voices = speechSynthesis.getVoices()
    const hindiVoice = voices.find((voice) => voice.lang.includes("hi"))
    const englishVoice = voices.find((voice) => voice.lang.includes("en"))

    if (hindiVoice) {
      utterance.voice = hindiVoice
    } else if (englishVoice) {
      utterance.voice = englishVoice
    }

    speechSynthesis.speak(utterance)
  }

  const value = {
    settings,
    updateSettings,
    speak,
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}
