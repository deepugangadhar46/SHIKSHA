"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Badge {
  id: string
  type: string
  name: string
  description: string
  icon: string
  earnedAt: Date
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface Achievement {
  id: string
  title: string
  description: string
  progress: number
  maxProgress: number
  completed: boolean
  reward: {
    points: number
    badge?: Badge
  }
}

export interface GameStats {
  level: number
  xp: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  badges: Badge[]
  achievements: Achievement[]
  subjectProgress: {
    [subject: string]: {
      level: number
      xp: number
      lessonsCompleted: number
      quizzesCompleted: number
      gamesPlayed: number
      averageScore: number
    }
  }
}

interface GameContextType {
  stats: GameStats
  addXP: (amount: number, subject?: string) => void
  addPoints: (amount: number) => void
  updateStreak: () => void
  earnBadge: (badge: Omit<Badge, "id" | "earnedAt">) => void
  completeLesson: (subject: string, xpReward: number) => void
  completeQuiz: (subject: string, score: number) => void
  completeGame: (subject: string, gameId: string, score: number, xpReward: number) => void
  resetProgress: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

interface GameProviderProps {
  children: React.ReactNode
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    xp: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    achievements: [],
    subjectProgress: {
      maths: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
      science: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
      english: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
      technology: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
      engineering: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
      odissi: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
    },
  })

  useEffect(() => {
    const savedStats = localStorage.getItem("shiksha-game-stats")
    if (savedStats) {
      const parsed = JSON.parse(savedStats)
      // Convert date strings back to Date objects
      parsed.badges = parsed.badges.map((badge: any) => ({
        ...badge,
        earnedAt: new Date(badge.earnedAt),
      }))
      setStats(parsed)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("shiksha-game-stats", JSON.stringify(stats))
  }, [stats])

  const calculateLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1
  }

  const addXP = (amount: number, subject?: string) => {
    setStats((prev) => {
      const newStats = { ...prev }
      const oldLevel = newStats.level
      newStats.xp += amount
      newStats.totalPoints += amount
      newStats.level = calculateLevel(newStats.xp)

      // Update subject progress if specified
      if (subject && newStats.subjectProgress[subject]) {
        newStats.subjectProgress[subject].xp += amount
        newStats.subjectProgress[subject].level = calculateLevel(newStats.subjectProgress[subject].xp)
      }

      // Save to localStorage
      localStorage.setItem("shiksha-game-stats", JSON.stringify(newStats))

      // Trigger XP gain celebration
      setTimeout(() => {
        const event = new CustomEvent("xpGained", { 
          detail: { 
            amount, 
            subject, 
            newTotal: newStats.totalPoints,
            levelUp: newStats.level > oldLevel,
            newLevel: newStats.level
          } 
        })
        window.dispatchEvent(event)
      }, 100)

      return newStats
    })
  }

  const addPoints = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + amount,
    }))
  }

  const updateStreak = () => {
    const today = new Date().toDateString()
    const lastActive = localStorage.getItem("shiksha-last-active")

    if (lastActive !== today) {
      setStats((prev) => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const newStreak = lastActive === yesterday.toDateString() ? prev.currentStreak + 1 : 1

        return {
          ...prev,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
        }
      })

      localStorage.setItem("shiksha-last-active", today)
    }
  }

  const earnBadge = (badgeData: Omit<Badge, "id" | "earnedAt">) => {
    const newBadge: Badge = {
      ...badgeData,
      id: Date.now().toString(),
      earnedAt: new Date(),
    }

    setStats((prev) => {
      const newStats = {
        ...prev,
        badges: [...prev.badges, newBadge],
      }
      // Save to localStorage
      localStorage.setItem("shiksha-game-stats", JSON.stringify(newStats))
      return newStats
    })

    // Trigger celebration animation with delay for better effect
    setTimeout(() => {
      const event = new CustomEvent("badgeEarned", { 
        detail: { 
          badge: newBadge,
          totalBadges: stats.badges.length + 1
        } 
      })
      window.dispatchEvent(event)
    }, 500)
  }

  const completeLesson = (subject: string, xpReward: number) => {
    setStats((prev) => {
      const newStats = { ...prev }

      if (newStats.subjectProgress[subject]) {
        newStats.subjectProgress[subject].lessonsCompleted += 1
      }

      return newStats
    })

    addXP(xpReward, subject)
    addPoints(xpReward * 2)
    updateStreak()

    // Check for achievements
    checkAchievements()
  }

  const completeQuiz = (subject: string, score: number) => {
    const xpReward = Math.floor(score * 10) // 10 XP per percentage point

    setStats((prev) => {
      const newStats = { ...prev }

      if (newStats.subjectProgress[subject]) {
        newStats.subjectProgress[subject].quizzesCompleted += 1
      }

      return newStats
    })

    addXP(xpReward, subject)
    addPoints(score * 5)

    // Perfect score badge
    if (score === 100) {
      earnBadge({
        type: "quiz_master",
        name: "Quiz Master",
        description: "Scored 100% on a quiz!",
        icon: "🧠",
        rarity: "rare",
      })
    }

    checkAchievements()
  }

  const completeGame = (subject: string, gameId: string, score: number, xpReward: number) => {
    setStats((prev) => {
      const newStats = { ...prev }

      if (newStats.subjectProgress[subject]) {
        const progress = newStats.subjectProgress[subject]
        progress.gamesPlayed += 1
        
        // Update average score
        const totalScore = progress.averageScore * (progress.gamesPlayed - 1) + score
        progress.averageScore = totalScore / progress.gamesPlayed
      }

      return newStats
    })

    addXP(xpReward, subject)
    addPoints(xpReward * 1.5)
    updateStreak()

    // Achievement checks for games
    if (score === 100) {
      earnBadge({
        type: "game_master",
        name: "Game Master",
        description: "Scored 100% in an educational game!",
        icon: "🎮",
        rarity: "rare",
      })
    }

    // Check if played 10 games
    const totalGamesPlayed = Object.values(stats.subjectProgress).reduce(
      (sum, progress) => sum + progress.gamesPlayed, 0
    )
    
    if (totalGamesPlayed === 10) {
      earnBadge({
        type: "gamer",
        name: "Dedicated Gamer",
        description: "Played 10 educational games!",
        icon: "🕹️",
        rarity: "common",
      })
    }

    checkAchievements()
  }

  const checkAchievements = () => {
    // Check for streak achievements
    if (stats.currentStreak === 7) {
      earnBadge({
        type: "week_warrior",
        name: "Week Warrior",
        description: "Maintained a 7-day learning streak!",
        icon: "⚔️",
        rarity: "epic",
      })
    }

    if (stats.currentStreak === 30) {
      earnBadge({
        type: "streak_master",
        name: "Streak Master",
        description: "Maintained a 30-day learning streak!",
        icon: "🔥",
        rarity: "legendary",
      })
    }
  }

  const resetProgress = () => {
    setStats({
      level: 1,
      xp: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
      achievements: [],
      subjectProgress: {
        maths: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
        science: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
        english: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
        technology: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
        engineering: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
        odissi: { level: 1, xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, gamesPlayed: 0, averageScore: 0 },
      },
    })
    localStorage.removeItem("shiksha-game-stats")
    localStorage.removeItem("shiksha-last-active")
  }

  const value = {
    stats,
    addXP,
    addPoints,
    updateStreak,
    earnBadge,
    completeLesson,
    completeQuiz,
    completeGame,
    resetProgress,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
