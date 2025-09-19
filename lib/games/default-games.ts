// Default Games Data for Odisha Rural Education Platform
// Transforms existing lesson structure into comprehensive game system

import { GameData } from '../storage/indexed-db';

export const defaultGameData: GameData[] = [
  // Mathematics Games (Classes 6-12)
  {
    id: 'math-drag-drop-algebra',
    title: 'Algebra Drag & Drop',
    subject: 'maths',
    classLevel: 8,
    gameType: 'drag-drop',
    difficulty: 'BEGINNER',
    timeEstimate: 15,
    xpReward: 120,
    isUnlocked: true,
    curriculumData: {
      topics: ['Linear Equations', 'Basic Algebra', 'Variables'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'math-geometry-builder',
    title: 'Geometry Shape Builder',
    subject: 'maths',
    classLevel: 9,
    gameType: 'puzzle',
    difficulty: 'INTERMEDIATE',
    timeEstimate: 20,
    xpReward: 150,
    isUnlocked: false,
    curriculumData: {
      topics: ['Triangles', 'Quadrilaterals', 'Circle Geometry'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'math-calculus-3d',
    title: 'Calculus 3D Explorer',
    subject: 'maths',
    classLevel: 12,
    gameType: 'simulation',
    difficulty: 'ADVANCED',
    timeEstimate: 25,
    xpReward: 200,
    isUnlocked: false,
    curriculumData: {
      topics: ['Derivatives', 'Integrals', '3D Graphing'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Science Games (Classes 6-12)
  {
    id: 'science-chemistry-lab',
    title: 'Virtual Chemistry Lab',
    subject: 'science',
    classLevel: 10,
    gameType: 'simulation',
    difficulty: 'INTERMEDIATE',
    timeEstimate: 20,
    xpReward: 140,
    isUnlocked: true,
    curriculumData: {
      topics: ['Chemical Reactions', 'Periodic Table', 'Lab Safety'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'science-biology-memory',
    title: 'Biology Memory Match',
    subject: 'science',
    classLevel: 9,
    gameType: 'memory',
    difficulty: 'BEGINNER',
    timeEstimate: 12,
    xpReward: 100,
    isUnlocked: true,
    curriculumData: {
      topics: ['Cell Structure', 'Human Body', 'Plant Biology'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'science-physics-motion',
    title: 'Physics Motion Simulator',
    subject: 'science',
    classLevel: 11,
    gameType: 'simulation',
    difficulty: 'ADVANCED',
    timeEstimate: 18,
    xpReward: 160,
    isUnlocked: false,
    curriculumData: {
      topics: ['Motion', 'Forces', 'Energy'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Technology Games (Classes 6-12)
  {
    id: 'tech-circuit-builder',
    title: 'Electronic Circuit Builder',
    subject: 'technology',
    classLevel: 8,
    gameType: 'puzzle',
    difficulty: 'BEGINNER',
    timeEstimate: 15,
    xpReward: 120,
    isUnlocked: true,
    curriculumData: {
      topics: ['Basic Electronics', 'Circuits', 'Components'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'tech-coding-maze',
    title: 'Programming Logic Maze',
    subject: 'technology',
    classLevel: 10,
    gameType: 'strategy',
    difficulty: 'INTERMEDIATE',
    timeEstimate: 20,
    xpReward: 150,
    isUnlocked: false,
    curriculumData: {
      topics: ['Programming Logic', 'Algorithms', 'Problem Solving'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Engineering Games (Classes 9-12)
  {
    id: 'eng-bridge-builder',
    title: 'Bridge Engineering Challenge',
    subject: 'engineering',
    classLevel: 11,
    gameType: 'simulation',
    difficulty: 'INTERMEDIATE',
    timeEstimate: 22,
    xpReward: 170,
    isUnlocked: false,
    curriculumData: {
      topics: ['Structural Engineering', 'Materials', 'Design'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'eng-rocket-physics',
    title: 'Rocket Physics Simulator',
    subject: 'engineering',
    classLevel: 12,
    gameType: 'simulation',
    difficulty: 'ADVANCED',
    timeEstimate: 25,
    xpReward: 200,
    isUnlocked: false,
    curriculumData: {
      topics: ['Aerospace Engineering', 'Physics', 'Mathematics'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // English Language Games (Classes 6-12)
  {
    id: 'eng-grammar-quest',
    title: 'Grammar Adventure Quest',
    subject: 'english',
    classLevel: 7,
    gameType: 'strategy',
    difficulty: 'BEGINNER',
    timeEstimate: 15,
    xpReward: 110,
    isUnlocked: true,
    curriculumData: {
      topics: ['Grammar Rules', 'Sentence Structure', 'Parts of Speech'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'eng-vocabulary-builder',
    title: 'Vocabulary Building Game',
    subject: 'english',
    classLevel: 8,
    gameType: 'memory',
    difficulty: 'BEGINNER',
    timeEstimate: 12,
    xpReward: 100,
    isUnlocked: true,
    curriculumData: {
      topics: ['Vocabulary', 'Word Meanings', 'Synonyms & Antonyms'],
      odishaBoard: true,
      language: ['en', 'od', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Odia Language & Culture Games (Classes 6-12)
  {
    id: 'odia-word-formation',
    title: 'Odia Word Formation',
    subject: 'odissi',
    classLevel: 6,
    gameType: 'drag-drop',
    difficulty: 'BEGINNER',
    timeEstimate: 15,
    xpReward: 120,
    isUnlocked: true,
    curriculumData: {
      topics: ['Odia Script', 'Word Formation', 'Basic Grammar'],
      odishaBoard: true,
      language: ['od', 'en', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'odia-festival-memory',
    title: 'Odisha Festival Memory Game',
    subject: 'odissi',
    classLevel: 8,
    gameType: 'memory',
    difficulty: 'BEGINNER',
    timeEstimate: 18,
    xpReward: 130,
    isUnlocked: true,
    curriculumData: {
      topics: ['Rath Yatra', 'Durga Puja', 'Kali Puja', 'Cultural Traditions'],
      odishaBoard: true,
      language: ['od', 'en', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'odia-dance-steps',
    title: 'Classical Odissi Dance Steps',
    subject: 'odissi',
    classLevel: 10,
    gameType: 'simulation',
    difficulty: 'INTERMEDIATE',
    timeEstimate: 20,
    xpReward: 150,
    isUnlocked: false,
    curriculumData: {
      topics: ['Odissi Dance', 'Classical Movements', 'Cultural Heritage'],
      odishaBoard: true,
      language: ['od', 'en', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'odia-temple-architecture',
    title: 'Temple Architecture Explorer',
    subject: 'odissi',
    classLevel: 11,
    gameType: 'puzzle',
    difficulty: 'INTERMEDIATE',
    timeEstimate: 22,
    xpReward: 160,
    isUnlocked: false,
    curriculumData: {
      topics: ['Konark Temple', 'Jagannath Temple', 'Architecture', 'History'],
      odishaBoard: true,
      language: ['od', 'en', 'hi']
    },
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Game Type Configurations
export const gameTypeConfigs = {
  'drag-drop': {
    name: 'Drag & Drop',
    description: 'Interactive drag and drop mechanics for hands-on learning',
    icon: '🎯',
    color: 'from-blue-400 to-blue-600',
    mechanics: ['drag', 'drop', 'sorting', 'matching']
  },
  'memory': {
    name: 'Memory Match',
    description: 'Memory-based games for vocabulary and concept retention',
    icon: '🧠',
    color: 'from-purple-400 to-purple-600',
    mechanics: ['flip', 'match', 'remember', 'sequence']
  },
  'puzzle': {
    name: 'Puzzle Solver',
    description: 'Logic puzzles and problem-solving challenges',
    icon: '🧩',
    color: 'from-green-400 to-green-600',
    mechanics: ['logic', 'assembly', 'pattern', 'solution']
  },
  'strategy': {
    name: 'Strategy Game',
    description: 'Strategic thinking and planning games',
    icon: '♟️',
    color: 'from-orange-400 to-orange-600',
    mechanics: ['planning', 'decision', 'consequence', 'optimization']
  },
  'simulation': {
    name: 'Simulation',
    description: 'Real-world simulations for practical learning',
    icon: '🔬',
    color: 'from-red-400 to-red-600',
    mechanics: ['experiment', 'observe', 'analyze', 'conclude']
  }
};

// Subject-specific game recommendations
export const subjectGameTypes = {
  maths: ['drag-drop', 'puzzle', 'simulation'],
  science: ['simulation', 'memory', 'puzzle'],
  technology: ['puzzle', 'strategy', 'simulation'],
  engineering: ['simulation', 'strategy', 'puzzle'],
  english: ['memory', 'drag-drop', 'strategy'],
  odissi: ['memory', 'simulation', 'drag-drop']
};

// Difficulty progression mapping
export const difficultyProgression = {
  BEGINNER: {
    xpMultiplier: 1.0,
    timeBonus: 1.2,
    hintPenalty: 0.1,
    requiredAccuracy: 60
  },
  INTERMEDIATE: {
    xpMultiplier: 1.5,
    timeBonus: 1.5,
    hintPenalty: 0.15,
    requiredAccuracy: 70
  },
  ADVANCED: {
    xpMultiplier: 2.0,
    timeBonus: 2.0,
    hintPenalty: 0.2,
    requiredAccuracy: 80
  }
};

// Class level to game mapping
export const classLevelGames = {
  6: ['math-drag-drop-algebra', 'science-biology-memory', 'odia-word-formation'],
  7: ['eng-grammar-quest', 'tech-circuit-builder'],
  8: ['math-drag-drop-algebra', 'science-chemistry-lab', 'odia-festival-memory', 'eng-vocabulary-builder'],
  9: ['math-geometry-builder', 'science-biology-memory'],
  10: ['science-chemistry-lab', 'tech-coding-maze', 'odia-dance-steps'],
  11: ['science-physics-motion', 'eng-bridge-builder', 'odia-temple-architecture'],
  12: ['math-calculus-3d', 'eng-rocket-physics']
};

export default defaultGameData;
