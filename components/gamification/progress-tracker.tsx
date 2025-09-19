"use client"
import { motion } from "framer-motion"
import { useGame } from "@/contexts/game-context"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressTrackerProps {
  subject?: string
  showOverall?: boolean
  className?: string
}

export function ProgressTracker({ subject, showOverall = true, className = "" }: ProgressTrackerProps) {
  const { stats } = useGame()
  const { t } = useLanguage()

  const getXPForNextLevel = (currentXP: number): number => {
    const currentLevel = Math.floor(currentXP / 100) + 1
    return currentLevel * 100
  }

  const getXPProgress = (currentXP: number): number => {
    const currentLevelXP = Math.floor(currentXP / 100) * 100
    const progressInLevel = currentXP - currentLevelXP
    return (progressInLevel / 100) * 100
  }

  const subjectIcons = {
    math: "🔢",
    science: "🔬",
    english: "📚",
    odia: "🏛️",
    social: "🌍",
  }

  const subjectColors = {
    math: "from-blue-400 to-blue-600",
    science: "from-green-400 to-green-600",
    english: "from-purple-400 to-purple-600",
    odia: "from-orange-400 to-orange-600",
    social: "from-teal-400 to-teal-600",
  }

  if (subject && stats.subjectProgress[subject]) {
    const subjectData = stats.subjectProgress[subject]
    const progress = getXPProgress(subjectData.xp)
    const nextLevelXP = getXPForNextLevel(subjectData.xp)

    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{subjectIcons[subject as keyof typeof subjectIcons]}</span>
            {t(`subjects.${subject}`) || subject}
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {t("game.level")} {subjectData.level}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{t("game.experience") || "Experience"}</span>
              <span>
                {subjectData.xp} / {nextLevelXP} XP
              </span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${subjectColors[subject as keyof typeof subjectColors]} rounded-full opacity-20`}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Completion Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-primary">{subjectData.lessonsCompleted}</div>
              <div className="text-xs text-muted-foreground">{t("progress.lessons_completed") || "Lessons"}</div>
            </div>

            <div className="bg-secondary/10 rounded-lg p-3">
              <div className="text-2xl font-bold text-secondary">{subjectData.quizzesCompleted}</div>
              <div className="text-xs text-muted-foreground">{t("progress.quizzes_completed") || "Quizzes"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showOverall) {
    const overallProgress = getXPProgress(stats.xp)
    const nextLevelXP = getXPForNextLevel(stats.xp)

    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🎓</span>
            {t("progress.overall_progress") || "Overall Progress"}
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {t("game.level")} {stats.level}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall XP Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{t("game.experience") || "Experience"}</span>
              <span>
                {stats.xp} / {nextLevelXP} XP
              </span>
            </div>
            <div className="relative">
              <Progress value={overallProgress} className="h-3" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="text-xl font-bold text-primary">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{t("game.points") || "Points"}</div>
            </div>

            <div className="bg-secondary/10 rounded-lg p-3">
              <div className="text-xl font-bold text-secondary">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">{t("game.streak") || "Streak"}</div>
            </div>

            <div className="bg-accent/10 rounded-lg p-3">
              <div className="text-xl font-bold text-accent">{stats.badges.length}</div>
              <div className="text-xs text-muted-foreground">{t("game.badges") || "Badges"}</div>
            </div>
          </div>

          {/* Subject Progress Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("progress.subject_overview") || "Subject Progress"}
            </h4>
            {Object.entries(stats.subjectProgress).map(([subjectKey, data]) => (
              <div key={subjectKey} className="flex items-center gap-3">
                <span className="text-lg">{subjectIcons[subjectKey as keyof typeof subjectIcons]}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{t(`subjects.${subjectKey}`) || subjectKey}</span>
                    <span>Lv.{data.level}</span>
                  </div>
                  <Progress value={getXPProgress(data.xp)} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
