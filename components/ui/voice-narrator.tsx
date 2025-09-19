"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAccessibility } from "@/contexts/accessibility-context"
import { useLanguage } from "@/contexts/language-context"

interface VoiceNarratorProps {
  text: string
  autoPlay?: boolean
  showButton?: boolean
  className?: string
}

export function VoiceNarrator({ text, autoPlay = false, showButton = true, className = "" }: VoiceNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const { settings } = useAccessibility()
  const { language } = useLanguage()

  useEffect(() => {
    setIsSupported("speechSynthesis" in window)
  }, [])

  useEffect(() => {
    if (autoPlay && settings.voiceEnabled && isSupported && text) {
      handleSpeak()
    }
  }, [text, autoPlay, settings.voiceEnabled, isSupported])

  const handleSpeak = () => {
    if (!isSupported || !settings.voiceEnabled) return

    // Stop any ongoing speech
    speechSynthesis.cancel()

    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8 // Slower for better comprehension
    utterance.pitch = 1
    utterance.volume = 0.8

    // Set language-appropriate voice
    const voices = speechSynthesis.getVoices()
    let selectedVoice = null

    // Set the language code for the utterance
    if (language === "hi") {
      utterance.lang = "hi-IN"
      selectedVoice = voices.find((voice) => voice.lang.includes("hi-IN") || voice.lang.includes("hi"))
    } else if (language === "od") {
      // Try Odia first, then fallback to Hindi
      utterance.lang = "or-IN" // Odia language code
      selectedVoice = voices.find((voice) => voice.lang.includes("or") || voice.lang.includes("ory"))
      if (!selectedVoice) {
        utterance.lang = "hi-IN"
        selectedVoice = voices.find((voice) => voice.lang.includes("hi-IN") || voice.lang.includes("hi"))
      }
    } else {
      utterance.lang = "en-IN"
      selectedVoice = voices.find((voice) => voice.lang.includes("en-IN"))
      if (!selectedVoice) {
        utterance.lang = "en-US"
        selectedVoice = voices.find((voice) => voice.lang.includes("en-US") || voice.lang.includes("en"))
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    speechSynthesis.speak(utterance)
  }

  if (!showButton || !isSupported || !settings.voiceEnabled) {
    return null
  }

  return (
    <motion.div className={className} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSpeak}
        className={`
          flex items-center gap-2 transition-all
          ${isPlaying ? "bg-primary text-primary-foreground" : ""}
        `}
      >
        <motion.span
          animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
        >
          {isPlaying ? "🔊" : "🎤"}
        </motion.span>
        <span className="text-xs">{isPlaying ? "Playing..." : "Listen"}</span>
      </Button>
    </motion.div>
  )
}
