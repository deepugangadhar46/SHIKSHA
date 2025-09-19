// Game Progression and XP System
// Handles student advancement, game unlocking, and achievement tracking
// Integrates with existing XP system and maintains UI design

import { GameStorageService, GameData, StudentProgress } from '../storage/indexed-db';

export interface StudentLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
  benefits: string[];
}

export interface GameUnlockRequirement {
  type: 'level' | 'games_completed' | 'subject_mastery' | 'streak' | 'score_average';
  value: number;
  subject?: string;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'persistence' | 'mastery' | 'social' | 'cultural';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirements: GameUnlockRequirement[];
  unlockedAt?: Date;
}

export interface SubjectMastery {
  subject: string;
  level: number;
  xp: number;
  gamesCompleted: number;
  averageScore: number;
  streak: number;
  masteryPercentage: number;
  weakAreas: string[];
  strongAreas: string[];
}

export class GameProgressionSystem {
  private static readonly XP_PER_LEVEL = 100;
  private static readonly MAX_LEVEL = 50;
  
  // Level titles with Odia cultural context
  private static readonly LEVEL_TITLES = {
    1: { en: 'Beginner', od: 'ନବାଗତ', hi: 'नवागत' },
    5: { en: 'Student', od: 'ଛାତ୍ର', hi: 'छात्र' },
    10: { en: 'Scholar', od: 'ବିଦ୍ୱାନ', hi: 'विद्वान' },
    15: { en: 'Expert', od: 'ପାରଦର୍ଶୀ', hi: 'पारदर्शी' },
    20: { en: 'Master', od: 'ଗୁରୁ', hi: 'गुरु' },
    25: { en: 'Sage', od: 'ଋଷି', hi: 'ऋषि' },
    30: { en: 'Pandit', od: 'ପଣ୍ଡିତ', hi: 'पंडित' },
    35: { en: 'Acharya', od: 'ଆଚାର୍ଯ୍ୟ', hi: 'आचार्य' },
    40: { en: 'Vidyasagar', od: 'ବିଦ୍ୟାସାଗର', hi: 'विद्यासागर' },
    50: { en: 'Jagadguru', od: 'ଜଗଦ୍‌ଗୁରୁ', hi: 'जगद्गुरु' }
  };

  /**
   * Calculate student's current level and XP status
   */
  static calculateStudentLevel(totalXP: number): StudentLevel {
    const level = Math.min(Math.floor(totalXP / this.XP_PER_LEVEL) + 1, this.MAX_LEVEL);
    const currentLevelXP = totalXP % this.XP_PER_LEVEL;
    const xpToNextLevel = level < this.MAX_LEVEL ? this.XP_PER_LEVEL - currentLevelXP : 0;
    
    const title = this.getLevelTitle(level);
    const benefits = this.getLevelBenefits(level);

    return {
      level,
      currentXP: currentLevelXP,
      xpToNextLevel,
      totalXP,
      title,
      benefits
    };
  }

  /**
   * Get level title based on current level
   */
  private static getLevelTitle(level: number): string {
    const titleLevels = Object.keys(this.LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    const titleLevel = titleLevels.find(tLevel => level >= tLevel) || 1;
    return this.LEVEL_TITLES[titleLevel as keyof typeof this.LEVEL_TITLES].en;
  }

  /**
   * Get benefits unlocked at current level
   */
  private static getLevelBenefits(level: number): string[] {
    const benefits: string[] = [];
    
    if (level >= 5) benefits.push('Access to intermediate games');
    if (level >= 10) benefits.push('Hint system unlocked');
    if (level >= 15) benefits.push('Advanced games available');
    if (level >= 20) benefits.push('Multiplayer challenges');
    if (level >= 25) benefits.push('Custom game creation');
    if (level >= 30) benefits.push('Mentor other students');
    if (level >= 35) benefits.push('Special cultural content');
    if (level >= 40) benefits.push('Research project access');
    if (level >= 50) benefits.push('Master teacher privileges');

    return benefits;
  }

  /**
   * Check if a game should be unlocked for a student
   */
  static async checkGameUnlockStatus(
    studentId: string, 
    game: GameData, 
    studentProgress: StudentProgress[]
  ): Promise<{ isUnlocked: boolean; requirements: GameUnlockRequirement[] }> {
    const requirements = this.getGameUnlockRequirements(game);
    const studentStats = await this.calculateStudentStats(studentId, studentProgress);
    
    let isUnlocked = true;
    const failedRequirements: GameUnlockRequirement[] = [];

    for (const requirement of requirements) {
      const meetsRequirement = await this.checkRequirement(requirement, studentStats, studentProgress);
      
      if (!meetsRequirement) {
        isUnlocked = false;
        failedRequirements.push(requirement);
      }
    }

    return {
      isUnlocked,
      requirements: failedRequirements
    };
  }

  /**
   * Get unlock requirements for a specific game
   */
  private static getGameUnlockRequirements(game: GameData): GameUnlockRequirement[] {
    const requirements: GameUnlockRequirement[] = [];

    // Basic level requirements
    switch (game.difficulty) {
      case 'BEGINNER':
        // Always unlocked
        break;
      case 'INTERMEDIATE':
        requirements.push({
          type: 'level',
          value: 5,
          description: 'Reach level 5'
        });
        requirements.push({
          type: 'games_completed',
          value: 3,
          description: 'Complete 3 games'
        });
        break;
      case 'ADVANCED':
        requirements.push({
          type: 'level',
          value: 15,
          description: 'Reach level 15'
        });
        requirements.push({
          type: 'subject_mastery',
          value: 70,
          subject: game.subject,
          description: `Achieve 70% mastery in ${game.subject}`
        });
        break;
    }

    // Subject-specific requirements
    if (game.subject === 'engineering' || game.subject === 'technology') {
      requirements.push({
        type: 'subject_mastery',
        value: 60,
        subject: 'maths',
        description: 'Achieve 60% mastery in Mathematics'
      });
    }

    // Class level requirements
    if (game.classLevel > 8) {
      requirements.push({
        type: 'score_average',
        value: 75,
        description: 'Maintain 75% average score'
      });
    }

    return requirements;
  }

  /**
   * Check if student meets a specific requirement
   */
  private static async checkRequirement(
    requirement: GameUnlockRequirement,
    studentStats: any,
    studentProgress: StudentProgress[]
  ): Promise<boolean> {
    switch (requirement.type) {
      case 'level':
        return studentStats.level >= requirement.value;
        
      case 'games_completed':
        return studentStats.gamesCompleted >= requirement.value;
        
      case 'subject_mastery':
        const subjectMastery = await this.calculateSubjectMastery(
          requirement.subject!, 
          studentProgress
        );
        return subjectMastery.masteryPercentage >= requirement.value;
        
      case 'streak':
        return studentStats.currentStreak >= requirement.value;
        
      case 'score_average':
        return studentStats.averageScore >= requirement.value;
        
      default:
        return true;
    }
  }

  /**
   * Calculate comprehensive student statistics
   */
  private static async calculateStudentStats(
    studentId: string, 
    studentProgress: StudentProgress[]
  ): Promise<any> {
    const totalXP = studentProgress.reduce((sum, p) => sum + p.xpEarned, 0);
    const level = this.calculateStudentLevel(totalXP).level;
    const gamesCompleted = studentProgress.length;
    const averageScore = gamesCompleted > 0 
      ? Math.round(studentProgress.reduce((sum, p) => sum + p.score, 0) / gamesCompleted)
      : 0;
    
    // Calculate streak
    const currentStreak = this.calculateCurrentStreak(studentProgress);
    
    // Calculate time-based stats
    const totalTimeSpent = studentProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageTimePerGame = gamesCompleted > 0 ? totalTimeSpent / gamesCompleted : 0;

    return {
      totalXP,
      level,
      gamesCompleted,
      averageScore,
      currentStreak,
      totalTimeSpent,
      averageTimePerGame
    };
  }

  /**
   * Calculate current learning streak
   */
  private static calculateCurrentStreak(studentProgress: StudentProgress[]): number {
    if (studentProgress.length === 0) return 0;

    // Sort by completion date (most recent first)
    const sortedProgress = [...studentProgress].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Start of today

    for (const progress of sortedProgress) {
      const progressDate = new Date(progress.completedAt);
      progressDate.setHours(0, 0, 0, 0); // Start of progress day

      const daysDiff = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0 || daysDiff === 1) {
        // Same day or consecutive day
        streak++;
        currentDate = progressDate;
      } else if (daysDiff > 1) {
        // Gap in streak
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate subject mastery
   */
  static async calculateSubjectMastery(
    subject: string, 
    studentProgress: StudentProgress[]
  ): Promise<SubjectMastery> {
    // Filter progress for this subject
    const subjectProgress = studentProgress.filter(async (progress) => {
      const game = await GameStorageService.getGame(progress.gameId);
      return game?.subject === subject;
    });

    const gamesCompleted = subjectProgress.length;
    const averageScore = gamesCompleted > 0 
      ? Math.round(subjectProgress.reduce((sum, p) => sum + p.score, 0) / gamesCompleted)
      : 0;
    
    const totalXP = subjectProgress.reduce((sum, p) => sum + p.xpEarned, 0);
    const level = Math.floor(totalXP / 50) + 1; // Subject levels are smaller increments

    // Calculate mastery percentage based on various factors
    const scoreFactor = averageScore / 100;
    const completionFactor = Math.min(gamesCompleted / 10, 1); // Max factor at 10 games
    const consistencyFactor = this.calculateConsistencyFactor(subjectProgress);
    
    const masteryPercentage = Math.round(
      (scoreFactor * 0.5 + completionFactor * 0.3 + consistencyFactor * 0.2) * 100
    );

    // Analyze weak and strong areas (simplified)
    const weakAreas = this.identifyWeakAreas(subjectProgress);
    const strongAreas = this.identifyStrongAreas(subjectProgress);

    return {
      subject,
      level,
      xp: totalXP,
      gamesCompleted,
      averageScore,
      streak: this.calculateCurrentStreak(subjectProgress),
      masteryPercentage,
      weakAreas,
      strongAreas
    };
  }

  /**
   * Calculate consistency factor for mastery
   */
  private static calculateConsistencyFactor(progress: StudentProgress[]): number {
    if (progress.length < 3) return 0.5; // Not enough data

    const scores = progress.map(p => p.score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    const consistencyFactor = Math.max(0, 1 - (standardDeviation / 50));
    return consistencyFactor;
  }

  /**
   * Identify weak areas based on game performance
   */
  private static identifyWeakAreas(progress: StudentProgress[]): string[] {
    // This would analyze game types, topics, etc. where student struggles
    // For now, return placeholder based on low scores
    const weakGames = progress.filter(p => p.score < 60);
    return weakGames.length > 0 ? ['Problem Solving', 'Time Management'] : [];
  }

  /**
   * Identify strong areas based on game performance
   */
  private static identifyStrongAreas(progress: StudentProgress[]): string[] {
    // This would analyze game types, topics, etc. where student excels
    // For now, return placeholder based on high scores
    const strongGames = progress.filter(p => p.score >= 80);
    return strongGames.length > 0 ? ['Quick Learning', 'Pattern Recognition'] : [];
  }

  /**
   * Award XP for game completion with bonuses
   */
  static calculateXPReward(
    baseXP: number,
    score: number,
    timeSpent: number,
    timeLimit: number,
    hintsUsed: number,
    difficulty: string,
    isFirstCompletion: boolean,
    currentStreak: number
  ): number {
    let totalXP = baseXP;

    // Score bonus (0-50% bonus based on score)
    const scoreBonus = Math.round(baseXP * (score / 100) * 0.5);
    totalXP += scoreBonus;

    // Time bonus (up to 25% bonus for completing quickly)
    const timeRatio = Math.max(0, (timeLimit - timeSpent) / timeLimit);
    const timeBonus = Math.round(baseXP * timeRatio * 0.25);
    totalXP += timeBonus;

    // Hint penalty (5% reduction per hint used)
    const hintPenalty = Math.round(baseXP * hintsUsed * 0.05);
    totalXP -= hintPenalty;

    // Difficulty multiplier
    const difficultyMultipliers = {
      'BEGINNER': 1.0,
      'INTERMEDIATE': 1.3,
      'ADVANCED': 1.6
    };
    const difficultyMultiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0;
    totalXP = Math.round(totalXP * difficultyMultiplier);

    // First completion bonus
    if (isFirstCompletion) {
      totalXP += Math.round(baseXP * 0.2);
    }

    // Streak bonus (up to 50% bonus for long streaks)
    const streakBonus = Math.min(currentStreak * 2, 50);
    totalXP += streakBonus;

    return Math.max(totalXP, 1); // Minimum 1 XP
  }

  /**
   * Get recommended next games for student
   */
  static async getRecommendedGames(
    studentId: string,
    classLevel: number,
    limit: number = 5
  ): Promise<GameData[]> {
    try {
      const studentProgress = await GameStorageService.getStudentGameHistory(studentId);
      const studentStats = await this.calculateStudentStats(studentId, studentProgress);

      // Get all available games for class level
      const allGames: GameData[] = [];
      const subjects = ['maths', 'science', 'technology', 'engineering', 'english', 'odissi'];
      
      for (const subject of subjects) {
        const subjectGames = await GameStorageService.getGamesBySubject(subject, classLevel);
        allGames.push(...subjectGames);
      }

      // Filter unlocked games
      const unlockedGames: GameData[] = [];
      for (const game of allGames) {
        const unlockStatus = await this.checkGameUnlockStatus(studentId, game, studentProgress);
        if (unlockStatus.isUnlocked) {
          unlockedGames.push(game);
        }
      }

      // Remove already completed games
      const completedGameIds = new Set(studentProgress.map(p => p.gameId));
      const availableGames = unlockedGames.filter(game => !completedGameIds.has(game.id));

      // Score games based on recommendation algorithm
      const scoredGames = availableGames.map(game => ({
        game,
        score: this.calculateRecommendationScore(game, studentStats, studentProgress)
      }));

      // Sort by recommendation score and return top games
      scoredGames.sort((a, b) => b.score - a.score);
      return scoredGames.slice(0, limit).map(item => item.game);

    } catch (error) {
      console.error('❌ Error getting recommended games:', error);
      return [];
    }
  }

  /**
   * Calculate recommendation score for a game
   */
  private static calculateRecommendationScore(
    game: GameData,
    studentStats: any,
    studentProgress: StudentProgress[]
  ): number {
    let score = 0;

    // Difficulty appropriateness (prefer games matching student level)
    const levelDifficultyMap = {
      'BEGINNER': 5,
      'INTERMEDIATE': 15,
      'ADVANCED': 25
    };
    const idealLevel = levelDifficultyMap[game.difficulty as keyof typeof levelDifficultyMap];
    const levelDifference = Math.abs(studentStats.level - idealLevel);
    score += Math.max(0, 50 - levelDifference * 2);

    // Subject balance (prefer subjects with less progress)
    // This would require more complex subject progress tracking
    score += 20;

    // Game type variety (prefer different game types)
    // This would require tracking recently played game types
    score += 15;

    // XP reward attractiveness
    score += Math.min(game.xpReward / 10, 15);

    return score;
  }

  /**
   * Check and award achievements
   */
  static async checkAndAwardAchievements(
    studentId: string,
    studentProgress: StudentProgress[]
  ): Promise<Achievement[]> {
    const availableAchievements = this.getAvailableAchievements();
    const newAchievements: Achievement[] = [];

    for (const achievement of availableAchievements) {
      // Check if already unlocked
      if (achievement.unlockedAt) continue;

      // Check if requirements are met
      const meetsRequirements = await this.checkAchievementRequirements(
        achievement,
        studentId,
        studentProgress
      );

      if (meetsRequirements) {
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  /**
   * Get all available achievements
   */
  private static getAvailableAchievements(): Achievement[] {
    return [
      {
        id: 'first_game',
        name: 'First Steps',
        description: 'Complete your first game',
        icon: '🎯',
        category: 'academic',
        rarity: 'common',
        xpReward: 50,
        requirements: [
          { type: 'games_completed', value: 1, description: 'Complete 1 game' }
        ]
      },
      {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Score 100% on any game',
        icon: '💯',
        category: 'academic',
        rarity: 'rare',
        xpReward: 100,
        requirements: [
          { type: 'score_average', value: 100, description: 'Score 100% on a game' }
        ]
      },
      {
        id: 'week_streak',
        name: 'Dedicated Learner',
        description: 'Play games for 7 consecutive days',
        icon: '🔥',
        category: 'persistence',
        rarity: 'epic',
        xpReward: 200,
        requirements: [
          { type: 'streak', value: 7, description: 'Maintain 7-day streak' }
        ]
      },
      {
        id: 'math_master',
        name: 'Mathematics Master',
        description: 'Achieve 90% mastery in Mathematics',
        icon: '🔢',
        category: 'mastery',
        rarity: 'epic',
        xpReward: 300,
        requirements: [
          { type: 'subject_mastery', value: 90, subject: 'maths', description: 'Master Mathematics' }
        ]
      },
      {
        id: 'cultural_explorer',
        name: 'Cultural Explorer',
        description: 'Complete 5 Odia culture games',
        icon: '🏛️',
        category: 'cultural',
        rarity: 'rare',
        xpReward: 150,
        requirements: [
          { type: 'subject_mastery', value: 50, subject: 'odissi', description: 'Explore Odia culture' }
        ]
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a game in under 30 seconds',
        icon: '⚡',
        category: 'academic',
        rarity: 'rare',
        xpReward: 120,
        requirements: [
          { type: 'games_completed', value: 1, description: 'Complete game quickly' }
        ]
      }
    ];
  }

  /**
   * Check if achievement requirements are met
   */
  private static async checkAchievementRequirements(
    achievement: Achievement,
    studentId: string,
    studentProgress: StudentProgress[]
  ): Promise<boolean> {
    const studentStats = await this.calculateStudentStats(studentId, studentProgress);

    for (const requirement of achievement.requirements) {
      const meets = await this.checkRequirement(requirement, studentStats, studentProgress);
      if (!meets) return false;
    }

    return true;
  }
}

export default GameProgressionSystem;
