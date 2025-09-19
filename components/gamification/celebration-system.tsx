"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Badge } from "@/contexts/game-context"
import { useLanguage } from "@/contexts/language-context"
import { useAccessibility } from "@/contexts/accessibility-context"

interface CelebrationEvent {
  type: "badge" | "levelUp" | "streak" | "achievement"
  data: any
  id: string
}

export function CelebrationSystem() {
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([])
  const { language, t } = useLanguage()
  const { speak } = useAccessibility()

  useEffect(() => {
    const handleBadgeEarned = (event: CustomEvent<Badge>) => {
      const celebration: CelebrationEvent = {
        type: "badge",
        data: event.detail,
        id: Date.now().toString(),
      }

      setCelebrations((prev) => [...prev, celebration])

      // Voice announcement
      speak(t("celebrations.badge_earned") || "Badge earned!")

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setCelebrations((prev) => prev.filter((c) => c.id !== celebration.id))
      }, 5000)
    }

    const handleLevelUp = (event: CustomEvent<{ level: number }>) => {
      const celebration: CelebrationEvent = {
        type: "levelUp",
        data: event.detail,
        id: Date.now().toString(),
      }

      setCelebrations((prev) => [...prev, celebration])
      speak(`${t("celebrations.level_up") || "Level up!"} ${event.detail.level}`)

      setTimeout(() => {
        setCelebrations((prev) => prev.filter((c) => c.id !== celebration.id))
      }, 5000)
    }

    const handleStreakMilestone = (event: CustomEvent<{ streak: number }>) => {
      const celebration: CelebrationEvent = {
        type: "streak",
        data: event.detail,
        id: Date.now().toString(),
      }

      setCelebrations((prev) => [...prev, celebration])
      speak(
        `${t("celebrations.streak_milestone") || "Streak milestone!"} ${event.detail.streak} ${t("game.days") || "days"}`,
      )

      setTimeout(() => {
        setCelebrations((prev) => prev.filter((c) => c.id !== celebration.id))
      }, 5000)
    }

    window.addEventListener("badgeEarned", handleBadgeEarned as EventListener)
    window.addEventListener("levelUp", handleLevelUp as EventListener)
    window.addEventListener("streakMilestone", handleStreakMilestone as EventListener)

    return () => {
      window.removeEventListener("badgeEarned", handleBadgeEarned as EventListener)
      window.removeEventListener("levelUp", handleLevelUp as EventListener)
      window.removeEventListener("streakMilestone", handleStreakMilestone as EventListener)
    }
  }, [language, t, speak])

  const renderCelebration = (celebration: CelebrationEvent) => {
    switch (celebration.type) {
      case "badge":
        return (
          <motion.div
            key={celebration.id}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-2xl max-w-sm mx-auto"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 2,
                }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>

              <h3 className="text-xl font-bold mb-2">{t("celebrations.new_badge") || "New Badge Earned!"}</h3>

              <p className="text-lg opacity-90">{celebration.data.name}</p>

              {/* Confetti particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{
                      x: "50%",
                      y: "50%",
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 300}%`,
                      y: `${50 + (Math.random() - 0.5) * 300}%`,
                      scale: [0, 1, 0],
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    {["🎉", "⭐", "🎊", "✨", "🌟", "💫", "🎈", "🎁"][i % 8]}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case "levelUp":
        return (
          <motion.div
            key={celebration.id}
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm mx-auto"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: 1,
                }}
                className="text-6xl mb-4"
              >
                🚀
              </motion.div>

              <h3 className="text-xl font-bold mb-2">{t("celebrations.level_up") || "Level Up!"}</h3>

              <p className="text-lg opacity-90">
                {t("celebrations.reached_level") || "You reached level"} {celebration.data.level}!
              </p>
            </div>
          </motion.div>
        )

      case "streak":
        return (
          <motion.div
            key={celebration.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-2xl max-w-sm mx-auto"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 3,
                }}
                className="text-6xl mb-4"
              >
                🔥
              </motion.div>

              <h3 className="text-xl font-bold mb-2">{t("celebrations.streak_milestone") || "Streak Milestone!"}</h3>

              <p className="text-lg opacity-90">
                {celebration.data.streak} {t("game.days") || "days"} {t("celebrations.in_a_row") || "in a row"}!
              </p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence mode="popLayout">{celebrations.map(renderCelebration)}</AnimatePresence>
    </div>
  )
}
