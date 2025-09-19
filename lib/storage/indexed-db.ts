// IndexedDB Storage for Offline Game Data
// Handles game progress, curriculum content, and user data for rural connectivity

import Dexie, { Table } from 'dexie';

// Game Data Interfaces
export interface GameData {
  id: string;
  title: string;
  subject: string;
  classLevel?: number;
  gameType?: 'drag-drop' | 'memory' | 'puzzle' | 'strategy' | 'simulation';
  type?: string; // Alternative to gameType for compatibility
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'beginner' | 'intermediate' | 'advanced';
  timeEstimate?: number;
  duration?: number; // Alternative to timeEstimate
  xpReward: number;
  isUnlocked?: boolean;
  description?: string; // Game description
  icon?: string; // Game icon
  color?: string; // Game color
  gradient?: string; // Game gradient
  curriculumData?: any;
  assets?: GameAsset[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GameAsset {
  id: string;
  gameId: string;
  type: 'image' | 'audio' | 'video' | 'json' | 'text';
  url: string;
  localPath?: string;
  size: number;
  cached: boolean;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  gameId: string;
  score: number;
  timeSpent: number;
  completedAt: Date;
  attempts: number;
  bestScore: number;
  xpEarned: number;
  hintsUsed: number;
  mistakes: number;
}

export interface CurriculumContent {
  id: string;
  subject: string;
  classLevel: number;
  topic: string;
  content: any;
  language: 'en' | 'od' | 'hi';
  lastUpdated: Date;
  version: string;
}

export interface GameSession {
  id: string;
  studentId: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  currentScore: number;
  currentLevel: number;
  gameState: any;
  isActive: boolean;
}

export interface OfflineQueue {
  id: string;
  type: 'progress' | 'completion' | 'achievement';
  data: any;
  timestamp: Date;
  synced: boolean;
}

// IndexedDB Database Class
class GameDatabase extends Dexie {
  games!: Table<GameData>;
  gameAssets!: Table<GameAsset>;
  studentProgress!: Table<StudentProgress>;
  curriculumContent!: Table<CurriculumContent>;
  gameSessions!: Table<GameSession>;
  offlineQueue!: Table<OfflineQueue>;

  constructor() {
    super('OdishaEducationGameDB');
    
    this.version(1).stores({
      games: 'id, subject, classLevel, gameType, difficulty, isUnlocked',
      gameAssets: 'id, gameId, type, cached',
      studentProgress: 'id, studentId, gameId, completedAt, score',
      curriculumContent: 'id, subject, classLevel, topic, language',
      gameSessions: 'id, studentId, gameId, isActive, startTime',
      offlineQueue: 'id, type, timestamp, synced'
    });
  }
}

// Initialize database instance
export const gameDB = new GameDatabase();

// Game Storage Service
export class GameStorageService {
  
  // Game Management
  static async saveGame(gameData: GameData): Promise<void> {
    await gameDB.games.put(gameData);
  }

  static async getGame(gameId: string): Promise<GameData | undefined> {
    return await gameDB.games.get(gameId);
  }

  static async getGamesBySubject(subject: string, classLevel: number): Promise<GameData[]> {
    return await gameDB.games
      .where({ subject, classLevel })
      .toArray();
  }

  static async getUnlockedGames(subject: string, classLevel: number): Promise<GameData[]> {
    return await gameDB.games
      .where({ subject, classLevel, isUnlocked: true })
      .toArray();
  }

  // Student Progress Management
  static async saveProgress(progress: StudentProgress): Promise<void> {
    await gameDB.studentProgress.put(progress);
    
    // Add to offline queue for sync
    await this.addToOfflineQueue('progress', progress);
  }

  static async getStudentProgress(studentId: string, gameId: string): Promise<StudentProgress | undefined> {
    return await gameDB.studentProgress
      .where({ studentId, gameId })
      .first();
  }

  static async getStudentGameHistory(studentId: string): Promise<StudentProgress[]> {
    return await gameDB.studentProgress
      .where({ studentId })
      .orderBy('completedAt')
      .reverse()
      .toArray();
  }

  // Game Session Management (for resuming games)
  static async saveGameSession(session: GameSession): Promise<void> {
    await gameDB.gameSessions.put(session);
  }

  static async getActiveSession(studentId: string): Promise<GameSession | undefined> {
    return await gameDB.gameSessions
      .where({ studentId, isActive: true })
      .first();
  }

  static async endGameSession(sessionId: string): Promise<void> {
    await gameDB.gameSessions.update(sessionId, { 
      isActive: false, 
      endTime: new Date() 
    });
  }

  // Curriculum Content Management
  static async saveCurriculumContent(content: CurriculumContent): Promise<void> {
    await gameDB.curriculumContent.put(content);
  }

  static async getCurriculumContent(
    subject: string, 
    classLevel: number, 
    topic?: string
  ): Promise<CurriculumContent[]> {
    let query = gameDB.curriculumContent.where({ subject, classLevel });
    
    if (topic) {
      query = query.and(item => item.topic === topic);
    }
    
    return await query.toArray();
  }

  // Asset Management for Offline Play
  static async saveGameAsset(asset: GameAsset): Promise<void> {
    await gameDB.gameAssets.put(asset);
  }

  static async getGameAssets(gameId: string): Promise<GameAsset[]> {
    return await gameDB.gameAssets
      .where({ gameId })
      .toArray();
  }

  static async getCachedAssets(gameId: string): Promise<GameAsset[]> {
    return await gameDB.gameAssets
      .where({ gameId, cached: true })
      .toArray();
  }

  // Offline Queue Management
  static async addToOfflineQueue(type: string, data: any): Promise<void> {
    const queueItem: OfflineQueue = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      data,
      timestamp: new Date(),
      synced: false
    };
    
    await gameDB.offlineQueue.put(queueItem);
  }

  static async getUnsyncedItems(): Promise<OfflineQueue[]> {
    return await gameDB.offlineQueue
      .where({ synced: false })
      .toArray();
  }

  static async markAsSynced(itemId: string): Promise<void> {
    await gameDB.offlineQueue.update(itemId, { synced: true });
  }

  // Game Unlocking Logic
  static async checkUnlockStatus(
    studentId: string, 
    gameId: string, 
    classLevel: number
  ): Promise<boolean> {
    const game = await this.getGame(gameId);
    if (!game) return false;

    // Get student's completed games
    const completedGames = await gameDB.studentProgress
      .where({ studentId })
      .and(progress => progress.score >= 70) // Passing score
      .toArray();

    // Basic unlocking logic - can be made more sophisticated
    const completedCount = completedGames.length;
    const requiredCompletions = this.getRequiredCompletions(game.difficulty);

    return completedCount >= requiredCompletions;
  }

  private static getRequiredCompletions(difficulty: string): number {
    switch (difficulty) {
      case 'BEGINNER': return 0; // Always unlocked
      case 'INTERMEDIATE': return 2; // Need 2 completed games
      case 'ADVANCED': return 5; // Need 5 completed games
      default: return 0;
    }
  }

  // Database Maintenance
  static async clearOldSessions(): Promise<void> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    await gameDB.gameSessions
      .where('endTime')
      .below(oneWeekAgo)
      .delete();
  }

  static async getStorageStats(): Promise<{
    games: number;
    progress: number;
    assets: number;
    sessions: number;
    queueItems: number;
  }> {
    return {
      games: await gameDB.games.count(),
      progress: await gameDB.studentProgress.count(),
      assets: await gameDB.gameAssets.count(),
      sessions: await gameDB.gameSessions.count(),
      queueItems: await gameDB.offlineQueue.where({ synced: false }).count()
    };
  }
}

// Initialize default games data
export async function initializeDefaultGames(): Promise<void> {
  const existingGames = await gameDB.games.count();
  
  if (existingGames === 0) {
    // Add default games from your existing lessons.ts
    const defaultGames = await import('../games/default-games');
    
    for (const game of defaultGames.defaultGameData) {
      await GameStorageService.saveGame(game);
    }
    
    console.log('✅ Default games initialized in IndexedDB');
  }
}

// Export database instance and service
export { gameDB as default };
