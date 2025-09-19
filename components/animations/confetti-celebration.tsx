"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccessibility } from "@/contexts/accessibility-context"

interface ConfettiCelebrationProps {
  trigger: boolean
  onComplete?: () => void
  intensity?: "low" | "medium" | "high"
  colors?: string[]
}

export function ConfettiCelebration({
  trigger,
  onComplete,
  intensity = "medium",
  colors = ["🎉", "🎊", "⭐", "✨", "🌟", "💫", "🎈", "🎁"],
}: ConfettiCelebrationProps) {
  const [isActive, setIsActive] = useState(false)
  const { settings } = useAccessibility()

  useEffect(() => {
    if (trigger && !settings.reducedMotion) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
        onComplete?.()
      }, 3000)
      return () => clearTimeout(timer)
    } else if (trigger && settings.reducedMotion) {
      // Show brief static celebration for reduced motion
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
        onComplete?.()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [trigger, settings.reducedMotion, onComplete])

  const particleCount = {
    low: 8,
    medium: 16,
    high: 24,
  }[intensity]

  if (settings.reducedMotion && isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      >
        <div className="text-6xl">🎉</div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {isActive && !settings.reducedMotion && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{
                x: "50vw",
                y: "50vh",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0.8, 0],
                rotate: [0, 180, 360, 540],
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            >
              {colors[i % colors.length]}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
