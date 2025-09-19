import { db, UserData, LessonProgress, GameStats, ContentData } from './indexed-db';

/**
 * Offline Database Manager
 * Ensures all data is stored locally in IndexedDB for complete offline functionality
 */
export class OfflineDBManager {
  private static instance: OfflineDBManager;
  private syncQueue: any[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  private constructor() {
    this.initializeEventListeners();
    // Only initialize the database in a browser environment where IndexedDB exists
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      this.initializeDatabase();
    }
  }

  static getInstance(): OfflineDBManager {
    if (!OfflineDBManager.instance) {
      OfflineDBManager.instance = new OfflineDBManager();
    }
    return OfflineDBManager.instance;
  }

  private initializeEventListeners() {
    // Only initialize event listeners in browser environment
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('Application is online - syncing data...');
        this.syncOfflineData();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('Application is offline - using local database');
      });
    }
  }

  private async initializeDatabase() {
    try {
      // Open the database
      await db.open();
      console.log('IndexedDB initialized successfully');
      
      // Create default data if database is empty
      const userCount = await db.users.count();
      if (userCount === 0) {
        await this.createDefaultData();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private async createDefaultData() {
    console.log('Creating default offline data...');
    
    // Create sample teacher account
    await db.users.add({
      email: 'teacher@shiksha.edu',
      password: 'teacher123', // In production, this should be hashed
      name: 'Demo Teacher',
      role: 'teacher',
      avatar: '👩‍🏫',
      school: 'SHIKSHA Demo School',
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true,
        soundEnabled: true,
        reducedMotion: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample student account
    await db.users.add({
      email: 'student@shiksha.edu',
      password: 'student123', // In production, this should be hashed
      name: 'Demo Student',
      role: 'student',
      avatar: '👨‍🎓',
      grade: 8,
      school: 'SHIKSHA Demo School',
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true,
        soundEnabled: true,
        reducedMotion: false,
      },
      culturalBackground: {
        region: 'Odisha',
        language: 'Odia',
        festivals: ['Rath Yatra', 'Durga Puja', 'Diwali'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Default data created successfully');
  }

  /**
   * Save user data locally
   */
  async saveUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData> {
    try {
      const newUser: UserData = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await db.users.add(newUser);
      const savedUser = await db.users.get(id);
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('user', 'create', savedUser);
      }

      return savedUser!;
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  }

  /**
   * Update user data locally
   */
  async updateUser(id: number, updates: Partial<UserData>): Promise<void> {
    try {
      await db.users.update(id, {
        ...updates,
        updatedAt: new Date(),
      });

      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('user', 'update', { id, updates });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Save lesson progress locally
   */
  async saveLessonProgress(progress: Omit<LessonProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const existingProgress = await db.lessonProgress
        .where(['userId', 'lessonId'])
        .equals([progress.userId, progress.lessonId])
        .first();

      if (existingProgress) {
        await db.lessonProgress.update(existingProgress.id!, {
          ...progress,
          updatedAt: new Date(),
        });
      } else {
        await db.lessonProgress.add({
          ...progress,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('lessonProgress', 'upsert', progress);
      }
    } catch (error) {
      console.error('Failed to save lesson progress:', error);
      throw error;
    }
  }

  /**
   * Save game statistics locally
   */
  async saveGameStats(stats: Partial<GameStats>): Promise<void> {
    try {
      const userId = stats.userId;
      if (!userId) throw new Error('User ID is required');

      const existingStats = await db.gameStats.where('userId').equals(userId).first();

      if (existingStats) {
        await db.gameStats.update(existingStats.id!, {
          ...stats,
          updatedAt: new Date(),
        });
      } else {
        await db.gameStats.add({
          ...stats,
          userId,
          level: stats.level || 1,
          totalPoints: stats.totalPoints || 0,
          currentStreak: stats.currentStreak || 0,
          longestStreak: stats.longestStreak || 0,
          badges: stats.badges || [],
          achievements: stats.achievements || [],
          subjectProgress: stats.subjectProgress || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        } as GameStats);
      }

      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('gameStats', 'upsert', stats);
      }
    } catch (error) {
      console.error('Failed to save game stats:', error);
      throw error;
    }
  }

  /**
   * Get user data from local database
   */
  async getUser(email: string): Promise<UserData | undefined> {
    try {
      return await db.users.where('email').equals(email).first();
    } catch (error) {
      console.error('Failed to get user:', error);
      return undefined;
    }
  }

  /**
   * Get all lesson progress for a user
   */
  async getUserLessonProgress(userId: number): Promise<LessonProgress[]> {
    try {
      return await db.lessonProgress.where('userId').equals(userId).toArray();
    } catch (error) {
      console.error('Failed to get lesson progress:', error);
      return [];
    }
  }

  /**
   * Get game stats for a user
   */
  async getUserGameStats(userId: number): Promise<GameStats | undefined> {
    try {
      return await db.gameStats.where('userId').equals(userId).first();
    } catch (error) {
      console.error('Failed to get game stats:', error);
      return undefined;
    }
  }

  /**
   * Save content data locally for offline access
   */
  async saveContent(content: Omit<ContentData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      await db.content.add({
        ...content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add to sync queue if offline
      if (!this.isOnline) {
        this.addToSyncQueue('content', 'create', content);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      throw error;
    }
  }

  /**
   * Get content by subject and grade
   */
  async getContent(subject: string, grade: number): Promise<ContentData[]> {
    try {
      return await db.content
        .where(['subject', 'grade'])
        .equals([subject, grade])
        .toArray();
    } catch (error) {
      console.error('Failed to get content:', error);
      return [];
    }
  }

  /**
   * Add data to sync queue for later synchronization
   */
  private addToSyncQueue(entity: string, action: string, data: any) {
    this.syncQueue.push({
      entity,
      action,
      data,
      timestamp: new Date(),
    });
    
    // Save sync queue to localStorage (browser only)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('shiksha-sync-queue', JSON.stringify(this.syncQueue));
    }
  }

  /**
   * Sync offline data when connection is restored
   */
  private async syncOfflineData() {
    if (this.syncQueue.length === 0 && typeof localStorage !== 'undefined') {
      // Load sync queue from localStorage
      const savedQueue = localStorage.getItem('shiksha-sync-queue');
      if (savedQueue) {
        this.syncQueue = JSON.parse(savedQueue);
      }
    }

    if (this.syncQueue.length === 0) {
      console.log('No offline data to sync');
      return;
    }

    console.log(`Syncing ${this.syncQueue.length} offline operations...`);

    // Process sync queue
    for (const item of this.syncQueue) {
      try {
        // Here you would normally sync with your backend API
        // For now, we'll just log the operation
        console.log(`Syncing ${item.entity} - ${item.action}:`, item.data);
        
        // In production, you would:
        // await backendAPI.sync(item);
      } catch (error) {
        console.error('Failed to sync item:', error);
        // Keep in queue for retry
        continue;
      }
    }

    // Clear successfully synced items
    this.syncQueue = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('shiksha-sync-queue');
    }
    console.log('Offline data sync completed');
  }

  /**
   * Clear all local data (for logout or reset)
   */
  async clearAllData() {
    try {
      await db.users.clear();
      await db.lessonProgress.clear();
      await db.gameStats.clear();
      await db.content.clear();
      await db.sessions.clear();
      
      // Clear sync queue
      this.syncQueue = [];
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('shiksha-sync-queue');
      }
      
      console.log('All local data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Export all user data (for backup)
   */
  async exportUserData(userId: number): Promise<any> {
    try {
      const user = await db.users.get(userId);
      const lessonProgress = await db.lessonProgress.where('userId').equals(userId).toArray();
      const gameStats = await db.gameStats.where('userId').equals(userId).first();
      
      return {
        user,
        lessonProgress,
        gameStats,
        exportedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  /**
   * Import user data (from backup)
   */
  async importUserData(data: any): Promise<void> {
    try {
      if (data.user) {
        await db.users.put(data.user);
      }
      
      if (data.lessonProgress) {
        for (const progress of data.lessonProgress) {
          await db.lessonProgress.put(progress);
        }
      }
      
      if (data.gameStats) {
        await db.gameStats.put(data.gameStats);
      }
      
      console.log('User data imported successfully');
    } catch (error) {
      console.error('Failed to import user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
// Only create the singleton in the browser to avoid SSR IndexedDB errors
export const offlineDB = (typeof window !== 'undefined' && typeof indexedDB !== 'undefined')
  ? OfflineDBManager.getInstance()
  : (undefined as unknown as OfflineDBManager);
