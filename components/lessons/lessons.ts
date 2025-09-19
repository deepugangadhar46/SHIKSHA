export interface GameCard {
  id: string
  title: string
  description: string
  duration: number // in minutes
  xpReward: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
  color: string
  category: string
  isLocked?: boolean
}

export interface SubjectGames {
  [key: string]: GameCard[]
}

export const subjectGames: SubjectGames = {
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
      description: 'Real-time 3D graphing and interactive calculus challenges (Unity)',
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
      description: 'Explore derivatives, integrals, and more in an interactive Unity WebGL scene',
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

export const getDifficultyColor = (difficulty: string) => {
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

export const getDifficultyText = (difficulty: string) => {
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
