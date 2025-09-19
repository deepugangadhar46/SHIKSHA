// Game Module Definitions for Educational Games
export interface GameModule {
  id: string;
  subject: 'maths' | 'science' | 'technology' | 'engineering' | 'english' | 'odissi';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  xpReward: number;
  icon: string;
  color: string;
  gradient: string;
  type: 'puzzle' | 'simulation' | 'quiz' | 'builder' | 'explorer' | 'racer';
  requiredLevel?: number;
  isLocked?: boolean;
}

// Mathematics Games
export const mathGames: GameModule[] = [
  {
    id: 'equation-quest',
    subject: 'maths',
    title: 'Equation Quest',
    description: 'Solve linear and quadratic equations to unlock paths in a maze',
    difficulty: 'beginner',
    duration: 15,
    xpReward: 120,
    icon: '🧮',
    color: 'from-purple-500 to-pink-500',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'puzzle'
  },
  {
    id: 'calculus-world-3d',
    subject: 'maths',
    title: 'Calculus World 3D',
    description: 'Real-time 3D graphing and interactive calculus challenges (Unity)',
    difficulty: 'advanced',
    duration: 20,
    xpReward: 180,
    icon: '📊',
    color: 'from-indigo-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'explorer',
    requiredLevel: 5
  },
  {
    id: 'calculus-explorer',
    subject: 'maths',
    title: 'Calculus Explorer',
    description: 'Explore derivatives, integrals, and more in an interactive Unity WebGL scene',
    difficulty: 'advanced',
    duration: 20,
    xpReward: 180,
    icon: '📈',
    color: 'from-blue-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'explorer',
    requiredLevel: 5
  },
  {
    id: 'geometry-builder',
    subject: 'maths',
    title: 'Geometry Builder',
    description: 'Construct shapes with given sides and angles to solve puzzles',
    difficulty: 'intermediate',
    duration: 20,
    xpReward: 150,
    icon: '📐',
    color: 'from-green-500 to-teal-600',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    type: 'builder',
    requiredLevel: 3
  },
  {
    id: 'math-racer',
    subject: 'maths',
    title: 'Math Racer',
    description: 'Answer quickly to speed up your race car and win the race',
    difficulty: 'beginner',
    duration: 10,
    xpReward: 100,
    icon: '🏎️',
    color: 'from-red-500 to-orange-500',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'racer'
  }
];

// Science Games
export const scienceGames: GameModule[] = [
  {
    id: 'chemistry-lab-simulator',
    subject: 'science',
    title: 'Chemistry Lab Simulator',
    description: 'Drag and drop elements to observe safe reactions and learn balancing',
    difficulty: 'beginner',
    duration: 20,
    xpReward: 140,
    icon: '🧪',
    color: 'from-green-500 to-emerald-600',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    type: 'simulation'
  },
  {
    id: 'science-quiz',
    subject: 'science',
    title: 'Science Quiz',
    description: 'Test your knowledge of physics, chemistry and biology with fun questions!',
    difficulty: 'beginner',
    duration: 12,
    xpReward: 120,
    icon: '🔬',
    color: 'from-teal-500 to-cyan-600',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    type: 'quiz'
  },
  {
    id: 'space-explorer',
    subject: 'science',
    title: 'Space Explorer',
    description: 'Pilot a ship by answering astronomy questions about planets and gravity',
    difficulty: 'intermediate',
    duration: 18,
    xpReward: 150,
    icon: '🚀',
    color: 'from-indigo-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'explorer'
  },
  {
    id: 'dna-code-breaker',
    subject: 'science',
    title: 'DNA Code Breaker',
    description: 'Pair bases (A-T, C-G) and handle mutations to form correct DNA strands',
    difficulty: 'intermediate',
    duration: 22,
    xpReward: 160,
    icon: '🧬',
    color: 'from-pink-500 to-rose-600',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'puzzle'
  }
];

// Technology Games
export const technologyGames: GameModule[] = [
  {
    id: 'circuit-builder',
    subject: 'technology',
    title: 'Circuit Builder',
    description: 'Connect wires, resistors, and LEDs to light up circuits',
    difficulty: 'beginner',
    duration: 15,
    xpReward: 120,
    icon: '⚡',
    color: 'from-yellow-500 to-orange-600',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'builder'
  },
  {
    id: 'coding-maze',
    subject: 'technology',
    title: 'Coding Maze',
    description: 'Write logic and loops to guide a robot out of a maze',
    difficulty: 'intermediate',
    duration: 15,
    xpReward: 130,
    icon: '🤖',
    color: 'from-blue-500 to-cyan-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'puzzle'
  },
  {
    id: 'ai-challenge',
    subject: 'technology',
    title: 'AI Challenge',
    description: 'Train a simple AI with yes/no data to improve its predictions',
    difficulty: 'intermediate',
    duration: 22,
    xpReward: 170,
    icon: '🧠',
    color: 'from-purple-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'simulation'
  }
];

// Engineering Games
export const engineeringGames: GameModule[] = [
  {
    id: 'bridge-builder',
    subject: 'engineering',
    title: 'Bridge Builder',
    description: 'Design a bridge with limited materials and test its strength',
    difficulty: 'intermediate',
    duration: 18,
    xpReward: 150,
    icon: '🌉',
    color: 'from-amber-500 to-orange-600',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    type: 'builder'
  },
  {
    id: 'rocket-launcher',
    subject: 'engineering',
    title: 'Rocket Launcher',
    description: 'Balance fuel, thrust, and angle to reach orbit or the moon',
    difficulty: 'advanced',
    duration: 25,
    xpReward: 200,
    icon: '🚀',
    color: 'from-red-500 to-pink-600',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    type: 'simulation',
    requiredLevel: 5,
    isLocked: true
  }
];

// English Games
export const englishGames: GameModule[] = [
  {
    id: 'word-builder',
    subject: 'english',
    title: 'Word Builder',
    description: 'Create words from jumbled letters and expand your vocabulary',
    difficulty: 'beginner',
    duration: 10,
    xpReward: 100,
    icon: '📝',
    color: 'from-purple-500 to-pink-500',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'puzzle'
  },
  {
    id: 'grammar-quest',
    subject: 'english',
    title: 'Grammar Quest',
    description: 'Master parts of speech and sentence structure through interactive challenges',
    difficulty: 'intermediate',
    duration: 15,
    xpReward: 130,
    icon: '📚',
    color: 'from-indigo-500 to-purple-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'quiz'
  },
  {
    id: 'story-creator',
    subject: 'english',
    title: 'Story Creator',
    description: 'Build your own stories with guided prompts and creative writing',
    difficulty: 'intermediate',
    duration: 20,
    xpReward: 150,
    icon: '✍️',
    color: 'from-blue-500 to-indigo-600',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'builder'
  }
];

// Odissi Culture Games
export const odissiGames: GameModule[] = [
  {
    id: 'dance-master',
    subject: 'odissi',
    title: 'Odissi Dance Master',
    description: 'Learn classical Odissi dance mudras and movements',
    difficulty: 'beginner',
    duration: 15,
    xpReward: 120,
    icon: '💃',
    color: 'from-orange-500 to-red-500',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'simulation'
  },
  {
    id: 'festival-explorer',
    subject: 'odissi',
    title: 'Festival Explorer',
    description: 'Discover Odisha festivals like Rath Yatra and Durga Puja',
    difficulty: 'beginner',
    duration: 12,
    xpReward: 110,
    icon: '🎪',
    color: 'from-yellow-500 to-orange-600',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    type: 'explorer'
  },
  {
    id: 'heritage-builder',
    subject: 'odissi',
    title: 'Heritage Builder',
    description: 'Build virtual models of famous Odisha temples and monuments',
    difficulty: 'intermediate',
    duration: 18,
    xpReward: 140,
    icon: '🏛️',
    color: 'from-amber-500 to-orange-600',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    type: 'builder',
    requiredLevel: 3
  },
  {
    id: 'culture-quiz',
    subject: 'odissi',
    title: 'Culture Champion',
    description: 'Test your knowledge of Odisha history, art, and traditions',
    difficulty: 'intermediate',
    duration: 10,
    xpReward: 100,
    icon: '🎭',
    color: 'from-pink-500 to-rose-600',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'quiz'
  }
];

// Get all games for a subject
export function getGamesForSubject(subject: string): GameModule[] {
  switch (subject) {
    case 'maths':
      return mathGames;
    case 'science':
      return scienceGames;
    case 'technology':
      return technologyGames;
    case 'engineering':
      return engineeringGames;
    case 'english':
      return englishGames;
    case 'odissi':
      return odissiGames;
    default:
      return [];
  }
}

// Get game by ID
export function getGameById(gameId: string): GameModule | undefined {
  const allGames = [
    ...mathGames, 
    ...scienceGames, 
    ...technologyGames, 
    ...engineeringGames,
    ...englishGames,
    ...odissiGames
  ];
  return allGames.find(game => game.id === gameId);
}

// Check if game is unlocked based on user level
export function isGameUnlocked(game: GameModule, userLevel: number): boolean {
  if (!game.requiredLevel) return true;
  return userLevel >= game.requiredLevel;
}
