"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Badge } from "@/contexts/game-context"
import { useLanguage } from "@/contexts/language-context"
import { useAccessibility } from "@/contexts/accessibility-context"

interface EnhancedBadgeSystemProps {
  badges: Badge[]
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  maxDisplay?: number
  className?: string
}

const badgeConfig = {
  first_login: {
    icon: "🎯",
    color: "from-blue-400 to-blue-600",
    name: { en: "First Steps", od: "ପ୍ରଥମ ପଦକ୍ଷେପ", hi: "पहला कदम" },
    description: {
      en: "Welcome to your learning journey!",
      od: "ଆପଣଙ୍କ ଶିକ୍ଷା ଯାତ୍ରାରେ ସ୍ୱାଗତ!",
      hi: "आपकी सीखने की यात्रा में आपका स्वागत है!",
    },
  },
  week_warrior: {
    icon: "⚔️",
    color: "from-red-400 to-red-600",
    name: { en: "Week Warrior", od: "ସପ୍ତାହ ଯୋଦ୍ଧା", hi: "सप्ताह योद्धा" },
    description: {
      en: "Completed lessons for 7 consecutive days",
      od: "୭ ଦିନ ଲଗାତାର ପାଠ ସମ୍ପୂର୍ଣ୍ଣ କରିଛନ୍ତି",
      hi: "7 दिन लगातार पाठ पूरे किए",
    },
  },
  quiz_master: {
    icon: "🧠",
    color: "from-purple-400 to-purple-600",
    name: { en: "Quiz Master", od: "କୁଇଜ୍ ମାଷ୍ଟର", hi: "क्विज मास्टर" },
    description: { en: "Scored 100% on a quiz", od: "କୁଇଜ୍‌ରେ ୧୦୦% ସ୍କୋର କରିଛନ୍ତି", hi: "क्विज में 100% स्कोर किया" },
  },
  subject_expert: {
    icon: "🎓",
    color: "from-green-400 to-green-600",
    name: { en: "Subject Expert", od: "ବିଷୟ ବିଶେଷଜ୍ଞ", hi: "विषय विशेषज्ञ" },
    description: {
      en: "Completed all lessons in a subject",
      od: "ଏକ ବିଷୟର ସମସ୍ତ ପାଠ ସମ୍ପୂର୍ଣ୍ଣ କରିଛନ୍ତି",
      hi: "एक विषय के सभी पाठ पूरे किए",
    },
  },
  streak_master: {
    icon: "🔥",
    color: "from-orange-400 to-orange-600",
    name: { en: "Streak Master", od: "ଧାରା ମାଷ୍ଟର", hi: "श्रृंखला मास्टर" },
    description: {
      en: "Maintained a 30-day learning streak",
      od: "୩୦ ଦିନର ଶିକ୍ଷା ଧାରା ବଜାୟ ରଖିଛନ୍ତି",
      hi: "30 दिन की सीखने की श्रृंखला बनाए रखी",
    },
  },
  cultural_explorer: {
    icon: "🏛️",
    color: "from-amber-400 to-orange-600",
    name: { en: "Cultural Explorer", od: "ସାଂସ୍କୃତିକ ଅନ୍ୱେଷକ", hi: "सांस्कृतिक खोजकर्ता" },
    description: { en: "Learned about Odisha culture", od: "ଓଡ଼ିଶା ସଂସ୍କୃତି ବିଷୟରେ ଶିଖିଛନ୍ତି", hi: "ओडिशा संस्कृति के बारे में सीखा" },
  },
}

export function EnhancedBadgeSystem({
  badges,
  size = "md",
  showTooltip = true,
  maxDisplay,
  className = "",
}: EnhancedBadgeSystemProps) {
  const { language } = useLanguage()
  const { speak } = useAccessibility()
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
    const config = badgeConfig[badge.type as keyof typeof badgeConfig]
    if (config) {
      const name = config.name[language as keyof typeof config.name] || config.name.en
      const description = config.description[language as keyof typeof config.description] || config.description.en
      speak(`${name}. ${description}`)
    }
  }

  const BadgeItem: React.FC<{ badge: Badge; index: number }> = ({ badge, index }) => {
    const config = badgeConfig[badge.type as keyof typeof badgeConfig]
    if (!config) return null

    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: index * 0.1,
          type: "spring",
          stiffness: 200,
          damping: 10,
        }}
        className="relative group cursor-pointer"
        onClick={() => handleBadgeClick(badge)}
      >
        <div
          className={`
          ${sizeClasses[size]} 
          bg-gradient-to-br ${config.color} 
          rounded-full flex items-center justify-center
          shadow-lg hover:shadow-xl transition-all duration-300
          transform hover:scale-110 active:scale-95
          border-2 border-white
          pulse-glow
        `}
        >
          <span className="text-white font-bold">{config.icon}</span>
        </div>

        {/* Rarity indicator */}
        <div
          className={`
          absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center
          ${
            badge.rarity === "legendary"
              ? "bg-yellow-400 text-yellow-900"
              : badge.rarity === "epic"
                ? "bg-purple-400 text-purple-900"
                : badge.rarity === "rare"
                  ? "bg-blue-400 text-blue-900"
                  : "bg-gray-400 text-gray-900"
          }
        `}
        >
          {badge.rarity === "legendary" ? "👑" : badge.rarity === "epic" ? "💎" : badge.rarity === "rare" ? "⭐" : "🔹"}
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 0, y: 10, scale: 0.8 }}
              whileHover={{ opacity: 1, y: -5, scale: 1 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 group-hover:block hidden"
            >
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl max-w-48">
                <div className="font-semibold">
                  {config.name[language as keyof typeof config.name] || config.name.en}
                </div>
                <div className="text-gray-300 text-xs mt-1">
                  {config.description[language as keyof typeof config.description] || config.description.en}
                </div>
                <div className="text-gray-400 text-xs mt-1">{new Date(badge.earnedAt).toLocaleDateString()}</div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Celebration particles */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 5,
            delay: index * 0.5,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xs"
              initial={{ x: "50%", y: "50%", scale: 0 }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 100}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
                scale: [0, 1, 0],
                rotate: 360,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Badge Display */}
      <div className="flex items-center gap-2 flex-wrap">
        {displayBadges.map((badge, index) => (
          <BadgeItem key={badge.id} badge={badge} index={index} />
        ))}

        {remainingCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: displayBadges.length * 0.1 }}
            className={`
              ${sizeClasses[size]}
              bg-gradient-to-br from-gray-400 to-gray-600
              rounded-full flex items-center justify-center
              shadow-lg text-white font-bold
              border-2 border-white
            `}
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const config = badgeConfig[selectedBadge.type as keyof typeof badgeConfig]
                if (!config) return null

                return (
                  <div className="text-center">
                    <div
                      className={`
                      w-20 h-20 mx-auto mb-4 rounded-full
                      bg-gradient-to-br ${config.color}
                      flex items-center justify-center text-3xl
                      shadow-lg celebration-bounce
                    `}
                    >
                      {config.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {config.name[language as keyof typeof config.name] || config.name.en}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {config.description[language as keyof typeof config.description] || config.description.en}
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-sm text-gray-500">Rarity:</span>
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${
                          selectedBadge.rarity === "legendary"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedBadge.rarity === "epic"
                              ? "bg-purple-100 text-purple-800"
                              : selectedBadge.rarity === "rare"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
