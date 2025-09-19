"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGame } from "@/contexts/game-context"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, Clock, Trophy, Zap, Lock, Play } from "lucide-react"
import { EnhancedBadgeSystem } from "@/components/gamification/enhanced-badge-system"
import { InteractiveLesson } from "@/components/lessons/interactive-lesson"
import { PageTransition } from "@/components/animations/page-transition"
import { LanguageSelector } from "@/components/ui/language-selector"
import { getGamesForSubject, isGameUnlocked, type GameModule } from "@/lib/games/game-modules"
import { SimpleGameContainer } from "@/components/games/SimpleGameContainer"

export default function StudentDashboard() {
  const [currentView, setCurrentView] = useState<"dashboard" | "lesson" | "leaderboard" | "games" | "playing">("dashboard")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<GameModule | null>(null)
  const [showGameModal, setShowGameModal] = useState(false)
  const [currentGameData, setCurrentGameData] = useState<any>(null)
  const [leaderboardTab, setLeaderboardTab] = useState<"global" | "school" | "friends">("global")
  const [showXPGain, setShowXPGain] = useState(false)
  const [xpGainAmount, setXPGainAmount] = useState(0)
  const [showBadgeEarned, setShowBadgeEarned] = useState(false)
  const [earnedBadge, setEarnedBadge] = useState<any>(null)

  const { stats, updateStreak } = useGame()
  const { language, t } = useLanguage()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?role=student')
    }
  }, [isLoading, isAuthenticated, router])

  // Listen for XP gains and badge earnings
  useEffect(() => {
    const handleXPGained = (event: CustomEvent) => {
      const { amount, levelUp, newLevel } = event.detail
      setXPGainAmount(amount)
      setShowXPGain(true)
      setTimeout(() => setShowXPGain(false), 2000)
      
      if (levelUp) {
        // Show level up celebration
        setTimeout(() => {
          alert(`🎉 Level Up! You're now Level ${newLevel}! 🌟`)
        }, 2500)
      }
    }

    const handleBadgeEarned = (event: CustomEvent) => {
      const { badge } = event.detail
      setEarnedBadge(badge)
      setShowBadgeEarned(true)
      setTimeout(() => setShowBadgeEarned(false), 4000)
    }

    window.addEventListener('xpGained', handleXPGained as EventListener)
    window.addEventListener('badgeEarned', handleBadgeEarned as EventListener)

    return () => {
      window.removeEventListener('xpGained', handleXPGained as EventListener)
      window.removeEventListener('badgeEarned', handleBadgeEarned as EventListener)
    }
  }, [])

  // Handle game launch
  const handleStartGame = (game: GameModule) => {
    // Convert GameModule to GameData format for GameContainer
    const gameData = {
      id: game.id,
      title: game.title,
      subject: game.subject,
      difficulty: game.difficulty,
      type: game.type,
      description: game.description,
      xpReward: game.xpReward,
      duration: game.duration,
      icon: game.icon,
      color: game.color,
      gradient: game.gradient
    }
    
    setCurrentGameData(gameData)
    setCurrentView("playing")
    setShowGameModal(false)
  }

  // Handle game completion
  const handleGameComplete = (score: number, xpEarned: number) => {
    // Update stats and show celebration
    setXPGainAmount(xpEarned)
    setShowXPGain(true)
    
    // Return to dashboard
    setTimeout(() => {
      setCurrentView("dashboard")
      setCurrentGameData(null)
    }, 2000)
  }

  // Handle game exit
  const handleGameExit = () => {
    setCurrentView("dashboard")
    setCurrentGameData(null)
  }

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

  // Calculate progress based on actual user data from game context
  const getSubjectProgress = (subjectKey: string) => {
    const subjectData = stats.subjectProgress[subjectKey]
    if (!subjectData) return 0
    
    // Calculate progress as percentage based on XP (every 100 XP = 10% progress)
    const progressPercentage = Math.min((subjectData.xp / 10), 100)
    return Math.round(progressPercentage)
  }

  const subjects = [
    { 
      key: "maths", 
      icon: "🔢", 
      color: "from-blue-400 to-blue-600", 
      name: { en: "Mathematics", od: "ଗଣିତ", hi: "गणित" }, 
      description: { en: "Geometric patterns in Odia temple architecture", od: "ଓଡ଼ିଆ ମନ୍ଦିର ସ୍ଥାପତ୍ୟରେ ଜ୍ୟାମିତିକ ଆକୃତି", hi: "ओडिया मंदिर वास्तुकला में ज्यामितीय पैटर्न" }, 
      progress: getSubjectProgress("maths") 
    },
    { 
      key: "science", 
      icon: "🔬", 
      color: "from-green-400 to-green-600", 
      name: { en: "Science", od: "ବିଜ୍ଞାନ", hi: "विज्ञान" }, 
      description: { en: "Konark Sun Temple scientific principles", od: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିରର ବୈଜ୍ଞାନିକ ନୀତି", hi: "कोणार्क सूर्य मंदिर के वैज्ञानिक सिद्धांत" }, 
      progress: getSubjectProgress("science") 
    },
    { 
      key: "technology", 
      icon: "💻", 
      color: "from-cyan-400 to-cyan-600", 
      name: { en: "Technology", od: "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା", hi: "प्रौद्योगिकी" }, 
      description: { en: "Digital preservation of Odia heritage", od: "ଓଡ଼ିଆ ଐତିହ୍ୟର ଡିଜିଟାଲ ସଂରକ୍ଷଣ", hi: "ओडिया विरासत का डिजिटल संरक्षण" }, 
      progress: getSubjectProgress("technology") 
    },
    { 
      key: "engineering", 
      icon: "⚙️", 
      color: "from-gray-400 to-gray-600", 
      name: { en: "Engineering", od: "ଇଞ୍ଜିନିୟରିଂ", hi: "इंजीनियरिंग" }, 
      description: { en: "Ancient Odia architectural engineering", od: "ପ୍ରାଚୀନ ଓଡ଼ିଆ ସ୍ଥାପତ୍ୟ ଇଞ୍ଜିନିୟରିଂ", hi: "प्राचीन ओडिया स्थापत्य इंजीनियरिंग" }, 
      progress: getSubjectProgress("engineering") 
    },
    { 
      key: "english", 
      icon: "📚", 
      color: "from-purple-400 to-purple-600", 
      name: { en: "English", od: "ଇଂରାଜୀ", hi: "अंग्रेजी" }, 
      description: { en: "English for Odisha tourism and communication", od: "ଓଡ଼ିଶା ପର୍ଯ୍ୟଟନ ଓ ଯୋଗାଯୋଗ ପାଇଁ ଇଂରାଜୀ", hi: "ओडिशा पर्यटन और संचार के लिए अंग्रेजी" }, 
      progress: getSubjectProgress("english") 
    },
    { 
      key: "odissi", 
      icon: "💃", 
      color: "from-orange-400 to-orange-600", 
      name: { en: "Odissi Culture", od: "ଓଡ଼ିଶୀ ସଂସ୍କୃତି", hi: "ओडिसी संस्कृति" }, 
      description: { en: "Classical dance, festivals, and traditions", od: "ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ, ପର୍ବ ଓ ପରମ୍ପରା", hi: "शास्त्रीय नृत्य, त्योहार और परंपराएं" }, 
      progress: getSubjectProgress("odissi") 
    },
  ]

  // Sample leaderboard data
  const leaderboardData = [
    { id: 1, name: "Priya Sharma", school: "Rural High School", xp: 12500, level: 15, streak: 21, badges: 45, avatar: "👩‍🎓", rank: 1 },
    { id: 2, name: "Arjun Patel", school: "Village Academy", xp: 11800, level: 14, streak: 18, badges: 42, avatar: "👨‍🎓", rank: 2 },
    { id: 3, name: "Meera Singh", school: "Community School", xp: 10900, level: 13, streak: 15, badges: 38, avatar: "👩‍🎓", rank: 3 },
    { id: 4, name: "Ravi Kumar", school: "Government School", xp: 9800, level: 12, streak: 12, badges: 35, avatar: "👨‍🎓", rank: 4 },
    { id: 5, name: "Anita Das", school: "Primary School", xp: 8900, level: 11, streak: 10, badges: 32, avatar: "👩‍🎓", rank: 5 },
    { id: 6, name: "Suresh Mohanty", school: "High School", xp: 8200, level: 10, streak: 8, badges: 28, avatar: "👨‍🎓", rank: 6 },
    { id: 7, name: "Kavita Jena", school: "Secondary School", xp: 7500, level: 9, streak: 6, badges: 25, avatar: "👩‍🎓", rank: 7 },
    { id: 8, name: user?.name || "You", school: "Your School", xp: stats.totalPoints, level: stats.level, streak: stats.currentStreak, badges: stats.badges.length, avatar: "🎓", rank: 8 },
  ]

  // Sample achievements
  const recentAchievements = [
    { id: 1, title: "First Steps", description: "Completed your first lesson", icon: "🏆", timeAgo: "2 hours ago" },
    { id: 2, title: "3 Day Streak", description: "Maintained 3 days of learning", icon: "🔥", timeAgo: "1 day ago" },
    { id: 3, title: "Math Master", description: "Scored 100% on algebra quiz", icon: "⭐", timeAgo: "3 days ago" },
  ]

  // Sample upcoming events
  const upcomingEvents = [
    { id: 1, title: "Math Competition", participants: 156, time: "Tomorrow", icon: "🎯" },
    { id: 2, title: "Science Fair", participants: 89, time: "Next Week", icon: "🔬" },
    { id: 3, title: "Coding Challenge", participants: 234, time: "This Weekend", icon: "💻" },
  ]

  const handleLessonComplete = (score: number) => {
    setCurrentView("dashboard")
    setSelectedSubject(null)
    updateStreak()
  }

  if (currentView === "lesson" && selectedSubject) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
          <InteractiveLesson
            subject={selectedSubject}
            lessonTitle={{
              en: `${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Lesson`,
              od: `${selectedSubject} ପାଠ`,
              hi: `${selectedSubject} पाठ`,
            }}
            questions={[]} // Will use default sample questions
            onComplete={handleLessonComplete}
          />
        </div>
      </PageTransition>
    )
  }

  if (currentView === "playing" && currentGameData) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <SimpleGameContainer
            gameData={currentGameData}
            onComplete={handleGameComplete}
            onExit={handleGameExit}
            className="w-full h-screen"
          />
        </div>
      </PageTransition>
    )
  }

  if (currentView === "leaderboard") {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
          <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  🏆 {t("leaderboard.title")}
                </h1>
                <p className="text-muted-foreground">{t("leaderboard.compete_message")}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentView("dashboard")}
                className="text-sm"
              >
                ← {t("leaderboard.back_to_dashboard")}
              </Button>
            </motion.div>

            {/* Your Rank Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="text-center">
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">#8</div>
                    <div className="text-sm text-muted-foreground">{t("leaderboard.your_rank")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">{stats.totalPoints}</div>
                    <div className="text-sm text-muted-foreground">{t("leaderboard.total_xp")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{stats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">{t("leaderboard.day_streak")}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Leaderboard Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { key: "global", label: `🌍 ${t("leaderboard.global")}`, icon: "🌍" },
                { key: "school", label: `🏫 ${t("leaderboard.school")}`, icon: "🏫" },
                { key: "friends", label: `👥 ${t("leaderboard.friends")}`, icon: "👥" },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={leaderboardTab === tab.key ? "default" : "outline"}
                  onClick={() => setLeaderboardTab(tab.key as any)}
                  className="flex items-center gap-2"
                >
                  {tab.icon} {tab.label.split(" ")[1]}
                </Button>
              ))}
            </div>

            {/* Top 3 Performers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-semibold text-center mb-8">{t("leaderboard.top_performers")}</h3>
              <div className="flex justify-center items-end gap-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                    {leaderboardData[1].avatar}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 min-w-[140px]">
                    <div className="text-lg font-bold text-secondary">2</div>
                    <div className="font-semibold">{leaderboardData[1].name}</div>
                    <div className="text-sm text-muted-foreground">{leaderboardData[1].school}</div>
                    <div className="text-sm font-medium text-primary">{leaderboardData[1].xp.toLocaleString()} XP</div>
                    <div className="text-xs text-muted-foreground">Level {leaderboardData[1].level}</div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto border-4 border-yellow-300">
                    {leaderboardData[0].avatar}
                  </div>
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 min-w-[160px] border-2 border-yellow-400">
                    <div className="text-2xl font-bold text-yellow-600">1</div>
                    <div className="font-bold text-lg">{leaderboardData[0].name}</div>
                    <div className="text-sm text-muted-foreground">{leaderboardData[0].school}</div>
                    <div className="text-lg font-bold text-primary">{leaderboardData[0].xp.toLocaleString()} XP</div>
                    <div className="text-sm text-muted-foreground">Level {leaderboardData[0].level}</div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                    {leaderboardData[2].avatar}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 min-w-[140px]">
                    <div className="text-lg font-bold text-orange-500">3</div>
                    <div className="font-semibold">{leaderboardData[2].name}</div>
                    <div className="text-sm text-muted-foreground">{leaderboardData[2].school}</div>
                    <div className="text-sm font-medium text-primary">{leaderboardData[2].xp.toLocaleString()} XP</div>
                    <div className="text-xs text-muted-foreground">Level {leaderboardData[2].level}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Full Rankings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold mb-6">{t("leaderboard.full_rankings")}</h3>
              <div className="space-y-3">
                {leaderboardData.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      player.name === user?.name || player.name.includes("You")
                        ? "bg-primary/10 border-2 border-primary/30"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="text-2xl font-bold text-primary w-8">#{player.rank}</div>
                    <div className="text-3xl">{player.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{player.name}</div>
                      <div className="text-sm text-muted-foreground">{player.school}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">Level {player.level}</div>
                      <div className="text-sm text-muted-foreground">{player.xp.toLocaleString()} XP</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-accent">{player.streak}</div>
                      <div className="text-sm text-muted-foreground">Streak</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-secondary">{player.badges}</div>
                      <div className="text-sm text-muted-foreground">Badges</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* XP Gain Celebration */}
        {showXPGain && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-20 right-8 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold">
              +{xpGainAmount} XP! 🌟
            </div>
            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 text-yellow-400 text-xl"
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Badge Earned Celebration */}
        {showBadgeEarned && earnedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-br from-yellow-100 to-orange-100 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.8, repeat: 2 }}
                className="text-8xl mb-4"
              >
                {earnedBadge.icon}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Badge Earned!</h2>
              <h3 className="text-xl font-semibold text-primary mb-3">{earnedBadge.name}</h3>
              <p className="text-gray-600 mb-6">{earnedBadge.description}</p>
              <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {earnedBadge.rarity.toUpperCase()} RARITY
              </div>
              {/* Confetti */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                  animate={{ 
                    opacity: 0,
                    y: Math.random() * -200 - 50,
                    x: (Math.random() - 0.5) * 300,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 text-2xl"
                >
                  {['🎊', '🎉', '🌟', '⭐', '💫', '🎈'][Math.floor(Math.random() * 6)]}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        <div className="relative z-10 container mx-auto px-4 py-8 space-y-6">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚀</div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t("student.welcome_back")}, {user?.name || "Ravi Kumar"}! 👋
                  </h1>
                  <p className="text-muted-foreground">
                    {t("student.stem_adventure")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSelector variant="compact" />
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("leaderboard")}
                  className="text-sm"
                >
                  🏆 {t("leaderboard.title")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await logout()
                    router.push('/')
                  }}
                  className="flex items-center gap-2"
                >
                  {t("common.logout") || "Logout"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Total Stars Earned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="glass-card p-6"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">⭐</div>
                <div className="text-3xl font-bold text-primary mb-2">{stats.totalPoints}</div>
                <div className="text-sm text-muted-foreground font-medium">{t("student.total_stars_earned")}</div>
                <div className="text-xs text-muted-foreground mt-1">{t("student.earn_stars_message")}</div>
              </div>
            </motion.div>

            {/* Current Streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="glass-card p-6 bg-gradient-to-br from-orange-100 to-red-100"
            >
              <div className="text-center">
                <div className="text-6xl font-bold text-orange-600 mb-2">{stats.currentStreak}</div>
                <div className="text-sm font-medium text-orange-700">{t("game.days")}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">{t("student.active")}</span>
                </div>
                <div className="mt-3 bg-white/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">{t("student.next_reward")}</div>
                  <div className="text-xs text-primary">🏆 7 {t("student.days_to_go")}</div>
                </div>
                <div className="text-xs text-orange-600 mt-2">🔥 {t("student.best_streak")}: 0 {t("game.days")}</div>
              </div>
            </motion.div>

            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="glass-card p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-800 mx-auto mb-3">
                  {stats.level}
                </div>
                <div className="text-lg font-bold text-foreground mb-2">Level {stats.level}</div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" 
                    style={{ width: `${(stats.totalPoints % 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{stats.totalPoints % 100} / 100 XP</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  {t("student.your_badges")}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {stats.badges.length} {t("student.earned")}
                </div>
              </div>
              <EnhancedBadgeSystem badges={stats.badges} maxDisplay={8} />
              {stats.badges.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎯</div>
                  <p className="text-muted-foreground">{t("student.complete_lessons_badge")}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Educational Games Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-center mb-8 gradient-text">🎮 Educational Games</h2>
              
              {/* Subject Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {subjects.map((subject) => (
                  <Button
                    key={subject.key}
                    variant={selectedSubject === subject.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubject(subject.key)}
                    className="flex items-center gap-2"
                  >
                    <span>{subject.icon}</span>
                    <span>{subject.name[language as keyof typeof subject.name] || subject.name.en}</span>
                  </Button>
                ))}
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedSubject && getGamesForSubject(selectedSubject).map((game, index) => {
                  const isUnlocked = isGameUnlocked(game, stats.level)
                  
                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, scale: 0.8, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 10
                      }}
                      whileHover={isUnlocked ? { 
                        scale: 1.02, 
                        y: -5,
                        transition: { duration: 0.3 }
                      } : {}}
                      className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl transition-all duration-500 border-2 cursor-pointer ${
                        !isUnlocked ? 'opacity-60' : 'hover:scale-105 hover:-translate-y-2'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${game.gradient || 'rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8)'})`,
                        borderColor: isUnlocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        boxShadow: isUnlocked 
                          ? `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px ${game.color.includes('blue') ? 'rgba(59, 130, 246, 0.3)' : game.color.includes('green') ? 'rgba(34, 197, 94, 0.3)' : game.color.includes('purple') ? 'rgba(147, 51, 234, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`
                          : '0 10px 25px -5px rgba(0,0,0,0.3)'
                      }}
                      onClick={() => {
                        if (isUnlocked) {
                          setSelectedGame(game)
                          setShowGameModal(true)
                        }
                      }}
                    >
                      {/* Difficulty Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`difficulty-badge difficulty-${game.difficulty}`}>
                          {game.difficulty}
                        </span>
                      </div>

                      {/* Game Icon */}
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3">{game.icon}</div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">
                          {game.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {game.description}
                        </p>
                      </div>

                      {/* Game Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            {game.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            +{game.xpReward} XP
                          </span>
                        </div>

                        {/* Play Button or Lock */}
                        <Button
                          className={`w-full ${isUnlocked ? 'bg-primary hover:bg-primary/90' : 'bg-muted'}`}
                          disabled={!isUnlocked}
                        >
                          {isUnlocked ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Lesson
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Level {game.requiredLevel} Required
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Show placeholder if no subject selected */}
                {!selectedSubject && (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">Select a Subject</h3>
                    <p className="text-muted-foreground">Choose a subject above to see available games</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Game Modal */}
          <AnimatePresence>
            {showGameModal && selectedGame && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={() => setShowGameModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 50 }}
                  className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-white/10 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: `linear-gradient(135deg, ${selectedGame.gradient || 'rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95)'})`
                  }}
                >
                  <div className="text-center relative">
                    {/* Close button */}
                    <button
                      onClick={() => setShowGameModal(false)}
                      className="absolute -top-4 -right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                    >
                      ✕
                    </button>

                    {/* Game Icon with glow effect */}
                    <motion.div 
                      className="text-7xl mb-6 filter drop-shadow-lg"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {selectedGame.icon}
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3 text-shadow">{selectedGame.title}</h2>
                    <p className="text-gray-200 mb-8 leading-relaxed">{selectedGame.description}</p>
                    
                    {/* Game Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">+{selectedGame.xpReward}</div>
                        <div className="text-xs text-gray-300 uppercase tracking-wide">XP Reward</div>
                      </div>
                      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{selectedGame.duration}</div>
                        <div className="text-xs text-gray-300 uppercase tracking-wide">Minutes</div>
                      </div>
                      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-green-400 mb-1 capitalize">{selectedGame.difficulty}</div>
                        <div className="text-xs text-gray-300 uppercase tracking-wide">Difficulty</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        className="flex-1 game-button from-green-500 to-emerald-600 py-4"
                        onClick={() => {
                          if (selectedGame) {
                            handleStartGame(selectedGame)
                          }
                        }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        <span className="font-bold">Start Game</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                        onClick={() => setShowGameModal(false)}
                      >
                        <span className="font-bold">Cancel</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Learning Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6 text-center">{t("student.learning_summary")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(stats.subjectProgress).reduce((acc, subject) => acc + (subject.lessonsCompleted || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("student.lessons_completed")}</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {subjects.length > 0 ? Math.floor(subjects.reduce((acc, s) => acc + s.progress, 0) / subjects.length) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">{t("student.overall_progress")}</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {subjects.filter(s => s.progress >= 70).length}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("student.subjects_mastered")}</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    #{leaderboardData.find(p => p.xp <= stats.totalPoints)?.rank || leaderboardData.length + 1}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("student.global_rank")}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activities and Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-6">{t("student.recent_achievements")}</h3>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{achievement.timeAgo}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="text-xs">
                    {t("student.view_all_achievements")}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-6">{t("student.upcoming_events")}</h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="text-2xl">{event.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.participants} participants</div>
                      </div>
                      <div className="text-sm font-medium text-primary">{event.time}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="text-xs">
                    {t("student.join_event")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </PageTransition>
  )
}
