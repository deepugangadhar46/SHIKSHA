"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/language-context"
import { useGame } from "@/contexts/game-context"
import { useAuth } from "@/contexts/auth-context"
import { backendClient } from "@/lib/api/backend-client"

// Game Configuration from backend config
const GAME_CONFIG = {
  XP_PER_LEVEL: 100,
  POINTS_MULTIPLIER: 2,
  QUIZ_XP_PER_PERCENTAGE: 10,
  PERFECT_SCORE_BONUS: 50,
  STREAK_BONUS_MULTIPLIER: 1.5
}

const SUBJECT_CONFIG = {
  maths: {
    icon: "🔢",
    color: "from-blue-400 to-blue-600",
    display_name: { en: "Mathematics", od: "ଗଣିତ", hi: "गणित" },
    difficulty_multiplier: 1.2
  },
  science: {
    icon: "🔬",
    color: "from-green-400 to-green-600",
    display_name: { en: "Science", od: "ବିଜ୍ଞାନ", hi: "विज्ञान" },
    difficulty_multiplier: 1.1
  },
  technology: {
    icon: "⚡",
    color: "from-yellow-400 to-yellow-600",
    display_name: { en: "Technology", od: "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା", hi: "प्रौद्योगिकी" },
    difficulty_multiplier: 1.3
  },
  engineering: {
    icon: "🌉",
    color: "from-orange-400 to-orange-600",
    display_name: { en: "Engineering", od: "ଇଞ୍ଜିନିୟରିଂ", hi: "इंजीनियरिंग" },
    difficulty_multiplier: 1.4
  },
  english: {
    icon: "📚",
    color: "from-indigo-400 to-indigo-600",
    display_name: { en: "English", od: "ଇଂରାଜୀ", hi: "अंग्रेजी" },
    difficulty_multiplier: 1.0
  },
  odissi: {
    icon: "🏛️",
    color: "from-pink-400 to-pink-600",
    display_name: { en: "Odissi Culture", od: "ଓଡ଼ିଶୀ ସଂସ୍କୃତି", hi: "ओडिसी संस्कृति" },
    difficulty_multiplier: 1.0
  }
}

interface GameCard {
  id: string
  title: string
  description: string
  duration: number
  xpReward: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
  color: string
  category: string
  isLocked?: boolean
}

interface InteractiveGameProps {
  subject: string
  onComplete: (score: number) => void
  className?: string
}

// Game Cards Data based on uploaded images
const getGamesBySubject = (subject: string): GameCard[] => {
  const gameBank: { [key: string]: GameCard[] } = {
    maths: [
      {
        id: 'equation-quest',
        title: 'Equation Quest',
        description: 'Solve linear and quadratic equations to unlock paths in a maze',
        duration: 15,
        xpReward: 120,
        difficulty: 'beginner',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        category: 'Algebra'
      },
      {
        id: 'geometry-builder',
        title: 'Geometry Builder',
        description: 'Construct shapes with given sides and angles to solve puzzles',
        duration: 20,
        xpReward: 150,
        difficulty: 'intermediate',
        icon: '📐',
        color: 'from-purple-400 to-purple-600',
        category: 'Geometry'
      },
      {
        id: 'math-racer',
        title: 'Math Racer',
        description: 'Answer quickly to speed up your race car and win the race',
        duration: 10,
        xpReward: 100,
        difficulty: 'beginner',
        icon: '🏎️',
        color: 'from-green-400 to-green-600',
        category: 'Arithmetic'
      },
      {
        id: 'calculus-world-3d',
        title: 'Calculus World 3D',
        description: 'Real-time 3D graphing and interactive calculus challenges',
        duration: 20,
        xpReward: 180,
        difficulty: 'advanced',
        icon: '📊',
        color: 'from-indigo-400 to-indigo-600',
        category: 'Calculus'
      },
      {
        id: 'calculus-explorer',
        title: 'Calculus Explorer',
        description: 'Explore derivatives, integrals, and more in an interactive scene',
        duration: 20,
        xpReward: 180,
        difficulty: 'advanced',
        icon: '🧮',
        color: 'from-cyan-400 to-cyan-600',
        category: 'Calculus'
      }
    ],
    science: [
      {
        id: 'chemistry-lab-simulator',
        title: 'Chemistry Lab Simulator',
        description: 'Drag and drop elements to observe safe reactions and learn balancing',
        duration: 20,
        xpReward: 140,
        difficulty: 'beginner',
        icon: '🧪',
        color: 'from-green-400 to-green-600',
        category: 'Chemistry'
      },
      {
        id: 'science-quiz',
        title: 'Science Quiz',
        description: 'Test your knowledge of physics, chemistry and biology with questions!',
        duration: 12,
        xpReward: 120,
        difficulty: 'beginner',
        icon: '🔬',
        color: 'from-teal-400 to-teal-600',
        category: 'General Science'
      },
      {
        id: 'space-explorer',
        title: 'Space Explorer',
        description: 'Pilot a ship by answering astronomy questions about planets and gravity',
        duration: 18,
        xpReward: 150,
        difficulty: 'intermediate',
        icon: '🚀',
        color: 'from-purple-400 to-purple-600',
        category: 'Astronomy'
      },
      {
        id: 'dna-code-breaker',
        title: 'DNA Code Breaker',
        description: 'Pair bases (A-T, C-G) and handle mutations to form correct DNA strands',
        duration: 22,
        xpReward: 160,
        difficulty: 'intermediate',
        icon: '🧬',
        color: 'from-pink-400 to-pink-600',
        category: 'Biology'
      }
    ],
    technology: [
      {
        id: 'circuit-builder',
        title: 'Circuit Builder',
        description: 'Connect wires, resistors, and LEDs to light up circuits',
        duration: 15,
        xpReward: 120,
        difficulty: 'beginner',
        icon: '⚡',
        color: 'from-yellow-400 to-yellow-600',
        category: 'Electronics'
      },
      {
        id: 'coding-maze',
        title: 'Coding Maze',
        description: 'Write logic and loops to guide a robot out of a maze',
        duration: 15,
        xpReward: 130,
        difficulty: 'intermediate',
        icon: '🤖',
        color: 'from-blue-400 to-blue-600',
        category: 'Programming'
      },
      {
        id: 'ai-challenge',
        title: 'AI Challenge',
        description: 'Train a simple AI with yes/no data to improve its predictions',
        duration: 22,
        xpReward: 170,
        difficulty: 'intermediate',
        icon: '🧠',
        color: 'from-purple-400 to-purple-600',
        category: 'Artificial Intelligence'
      }
    ],
    engineering: [
      {
        id: 'bridge-builder',
        title: 'Bridge Builder',
        description: 'Design a bridge with limited materials and test its strength',
        duration: 18,
        xpReward: 150,
        difficulty: 'intermediate',
        icon: '🌉',
        color: 'from-orange-400 to-orange-600',
        category: 'Civil Engineering'
      },
      {
        id: 'rocket-launcher',
        title: 'Rocket Launcher',
        description: 'Balance fuel, thrust, and angle to reach orbit or the moon',
        duration: 25,
        xpReward: 200,
        difficulty: 'advanced',
        icon: '🚀',
        color: 'from-red-400 to-red-600',
        category: 'Aerospace Engineering'
      }
    ],
    english: [
      {
        id: 'grammar-quest',
        title: 'Grammar Quest',
        description: 'Master English grammar through interactive storytelling adventures',
        duration: 15,
        xpReward: 110,
        difficulty: 'beginner',
        icon: '📚',
        color: 'from-indigo-400 to-indigo-600',
        category: 'Grammar'
      },
      {
        id: 'vocabulary-builder',
        title: 'Vocabulary Builder',
        description: 'Expand your English vocabulary with Odisha cultural contexts',
        duration: 12,
        xpReward: 100,
        difficulty: 'beginner',
        icon: '📖',
        color: 'from-green-400 to-green-600',
        category: 'Vocabulary'
      }
    ],
    odissi: [
      {
        id: 'dance-steps',
        title: 'Classical Dance Steps',
        description: 'Learn traditional Odissi dance movements and their meanings',
        duration: 20,
        xpReward: 140,
        difficulty: 'beginner',
        icon: '💃',
        color: 'from-pink-400 to-pink-600',
        category: 'Dance'
      },
      {
        id: 'festival-traditions',
        title: 'Festival Traditions',
        description: 'Explore Rath Yatra, Durga Puja, and other Odia festivals',
        duration: 18,
        xpReward: 130,
        difficulty: 'beginner',
        icon: '🎭',
        color: 'from-orange-400 to-orange-600',
        category: 'Culture'
      }
    ]
  }
  
  return gameBank[subject] || gameBank.science
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500'
    case 'intermediate':
      return 'bg-yellow-500'
    case 'advanced':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    default:
      return 'Unknown'
  }
}

export function InteractiveGame({
  subject,
  onComplete,
  className = "",
}: InteractiveGameProps) {
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameQuestions, setGameQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [gameComplete, setGameComplete] = useState(false)

  const { language, t } = useLanguage()
  const { completeLesson, addXP, earnBadge } = useGame()
  const { user } = useAuth()

  const games = getGamesBySubject(subject)
  const subjectConfig = SUBJECT_CONFIG[subject as keyof typeof SUBJECT_CONFIG]

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameComplete && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted) {
      handleGameComplete()
    }
  }, [timeLeft, gameStarted, gameComplete])

  const handleGameSelect = async (game: GameCard) => {
    setSelectedGame(game)
    setIsLoading(true)
    
    try {
      // Get user grade from auth context or default to 8
      const userGrade = user?.grade || 8
      
      // Generate questions based on user's grade and selected game
      const questions = await backendClient.generateQuestions({
        subject: subject as any,
        grade: userGrade,
        topic: game.category,
        count: 10,
        difficulty: game.difficulty === 'beginner' ? 'easy' : game.difficulty === 'advanced' ? 'hard' : 'medium'
      })
      
      setGameQuestions(questions)
      setGameStarted(true)
      setTimeLeft(game.duration * 60) // Convert minutes to seconds
    } catch (error) {
      console.error('Failed to generate questions:', error)
      // Use fallback questions if backend fails
      setGameQuestions([])
      setGameStarted(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null && gameQuestions[currentQuestion]) {
      const isCorrect = selectedAnswer === gameQuestions[currentQuestion].correctAnswer
      if (isCorrect) {
        setScore(score + 1)
        // Award XP based on difficulty
        const xpReward = selectedGame ? Math.floor(selectedGame.xpReward / 10) : 10
        addXP(xpReward, subject)
      }
      setShowExplanation(true)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      handleGameComplete()
    }
  }

  const handleGameComplete = () => {
    setGameComplete(true)
    const finalScore = Math.round((score / gameQuestions.length) * 100)
    
    if (selectedGame) {
      // Award full XP for game completion
      addXP(selectedGame.xpReward, subject)
      completeLesson(subject, selectedGame.xpReward)
      
      // Award badges for perfect scores
      if (finalScore === 100) {
        earnBadge({
          type: "quiz_master",
          name: "Game Master",
          description: "Perfect score in a learning game!",
          icon: "🎮",
          rarity: "rare",
        })
      }
    }
    
    onComplete(finalScore)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-8 text-center"
      >
        <div className="glass-card p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">Loading Game...</h3>
          <p className="text-muted-foreground">
            Generating personalized questions for {selectedGame?.title}
          </p>
        </div>
      </motion.div>
    )
  }

  // Game completion screen
  if (gameComplete) {
    const finalScore = Math.round((score / gameQuestions.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8"
      >
        <Card className="glass-card text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              {finalScore >= 90 ? "🏆" : finalScore >= 70 ? "🎉" : "💪"}
            </motion.div>
            <CardTitle className="text-2xl">Game Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold text-primary">{finalScore}%</div>
            <p className="text-muted-foreground">
              You scored {score} out of {gameQuestions.length} questions correctly
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={() => window.location.reload()}>
                Play Again
              </Button>
              <Button variant="outline" onClick={() => onComplete(finalScore)}>
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Game play screen
  if (gameStarted && gameQuestions.length > 0) {
    const currentQ = gameQuestions[currentQuestion]
    const progress = ((currentQuestion + 1) / gameQuestions.length) * 100

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{selectedGame?.icon}</div>
            <div>
              <h2 className="text-xl font-bold">{selectedGame?.title}</h2>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {gameQuestions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-lg font-mono">⏱️ {formatTime(timeLeft)}</div>
            <div className="text-lg">🎯 {score}/{gameQuestions.length}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-6" />

        {/* Question Card */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {currentQ.question[language as keyof typeof currentQ.question] || currentQ.question.en}
            </h3>

            {/* Answer Options */}
            <div className="grid gap-3">
              {currentQ.options?.[language as keyof typeof currentQ.options]?.map((option: string, index: number) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`
                    p-4 text-left rounded-lg border-2 transition-all
                    ${selectedAnswer === index 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                    }
                    ${showExplanation && index === currentQ.correctAnswer 
                      ? 'border-green-500 bg-green-500/10' 
                      : ''
                    }
                    ${showExplanation && selectedAnswer === index && index !== currentQ.correctAnswer 
                      ? 'border-red-500 bg-red-500/10' 
                      : ''
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    {option}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-muted rounded-lg"
              >
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p>{currentQ.explanation[language as keyof typeof currentQ.explanation] || currentQ.explanation.en}</p>
                {currentQ.culturalContext && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                    <h5 className="font-medium text-primary mb-1">Cultural Context:</h5>
                    <p className="text-sm">{currentQ.culturalContext[language as keyof typeof currentQ.culturalContext] || currentQ.culturalContext.en}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              {!showExplanation ? (
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestion < gameQuestions.length - 1 ? 'Next Question' : 'Complete Game'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Game selection screen (matches uploaded images)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`max-w-6xl mx-auto p-6 ${className}`}
    >
      {/* Subject Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{subjectConfig?.icon}</div>
        <h1 className="text-3xl font-bold mb-2">
          {subjectConfig?.display_name[language as keyof typeof subjectConfig.display_name] || subject}
        </h1>
        <p className="text-muted-foreground">Choose a game to start learning!</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card h-full hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                {/* Difficulty Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-3xl">{game.icon}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(game.difficulty)}`}>
                    {getDifficultyText(game.difficulty)}
                  </span>
                </div>

                {/* Game Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {game.title}
                </h3>

                {/* Game Description */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {game.description}
                </p>

                {/* Game Stats */}
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{game.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>+{game.xpReward}</span>
                  </div>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={() => handleGameSelect(game)}
                  className="w-full group-hover:scale-105 transition-transform"
                  variant="default"
                >
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
