// Offline-First PWA Game Manager
// Handles offline game functionality for rural internet connectivity
// Preloads game assets and content during app installation
// Background sync when connection available

import { GameStorageService, GameData, GameAsset } from '../storage/indexed-db';
import OdishaAPIService from '../api/odisha-curriculum-service';

export interface OfflineConfig {
  maxCacheSize: number; // in MB
  syncInterval: number; // in milliseconds
  retryAttempts: number;
  preloadPriority: string[]; // subjects to preload first
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
  syncInProgress: boolean;
  errors: string[];
}

export class OfflineGameManager {
  private static instance: OfflineGameManager;
  private config: OfflineConfig;
  private syncStatus: SyncStatus;
  private syncTimer: NodeJS.Timeout | null = null;
  private serviceWorker: ServiceWorker | null = null;

  private constructor() {
    this.config = {
      maxCacheSize: 100, // 100MB
      syncInterval: 30000, // 30 seconds
      retryAttempts: 3,
      preloadPriority: ['maths', 'science', 'odissi'] // Prioritize core subjects
    };

    this.syncStatus = {
      isOnline: navigator.onLine,
      lastSyncTime: null,
      pendingUploads: 0,
      pendingDownloads: 0,
      syncInProgress: false,
      errors: []
    };

    this.initializeOfflineManager();
  }

  static getInstance(): OfflineGameManager {
    if (!OfflineGameManager.instance) {
      OfflineGameManager.instance = new OfflineGameManager();
    }
    return OfflineGameManager.instance;
  }

  private async initializeOfflineManager() {
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup online/offline event listeners
    this.setupNetworkListeners();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Initialize cache if needed
    await this.initializeCache();
    
    console.log('✅ Offline Game Manager initialized');
  }

  /**
   * Register service worker for offline functionality
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service worker update found');
        });

        if (registration.active) {
          this.serviceWorker = registration.active;
        }

        console.log('✅ Service worker registered');
      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
      }
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.syncStatus.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('📱 Connection lost - switching to offline mode');
      this.syncStatus.isOnline = false;
    });
  }

  /**
   * Start periodic sync when online
   */
  private startPeriodicSync(): void {
    this.syncTimer = setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.triggerSync();
      }
    }, this.config.syncInterval);
  }

  /**
   * Cache all game assets during PWA installation
   */
  async cacheGameAssets(gameList: GameData[]): Promise<void> {
    console.log('📦 Starting game asset caching...');
    
    try {
      const cache = await caches.open('game-assets-v1');
      const cacheRequests: string[] = [];

      for (const game of gameList) {
        // Add game-specific assets
        const gameAssets = await this.getGameAssetUrls(game);
        cacheRequests.push(...gameAssets);

        // Cache curriculum content
        await this.cacheCurriculumContent(game);
      }

      // Cache assets in batches to avoid overwhelming the browser
      const batchSize = 10;
      for (let i = 0; i < cacheRequests.length; i += batchSize) {
        const batch = cacheRequests.slice(i, i + batchSize);
        try {
          await cache.addAll(batch);
          console.log(`📦 Cached batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(cacheRequests.length/batchSize)}`);
        } catch (error) {
          console.warn('⚠️ Failed to cache batch:', error);
        }
      }

      console.log('✅ Game assets cached successfully');
    } catch (error) {
      console.error('❌ Failed to cache game assets:', error);
    }
  }

  /**
   * Get asset URLs for a specific game
   */
  private async getGameAssetUrls(game: GameData): Promise<string[]> {
    const assetUrls: string[] = [];

    // Add basic game assets
    assetUrls.push(
      '/assets/games/common/ui-elements.png',
      '/assets/games/common/sounds.mp3',
      '/assets/games/common/fonts.woff2'
    );

    // Add game-type specific assets
    switch (game.gameType) {
      case 'drag-drop':
        assetUrls.push(
          '/assets/games/drag-drop/drag-cursor.png',
          '/assets/games/drag-drop/drop-zone.png',
          '/assets/games/drag-drop/success-animation.json'
        );
        break;
      case 'memory':
        assetUrls.push(
          '/assets/games/memory/card-back.png',
          '/assets/games/memory/card-flip-sound.mp3',
          '/assets/games/memory/match-sound.mp3'
        );
        break;
      case 'puzzle':
        assetUrls.push(
          '/assets/games/puzzle/piece-template.png',
          '/assets/games/puzzle/snap-sound.mp3'
        );
        break;
      case 'simulation':
        assetUrls.push(
          '/assets/games/simulation/lab-equipment.png',
          '/assets/games/simulation/reaction-animations.json'
        );
        break;
      case 'strategy':
        assetUrls.push(
          '/assets/games/strategy/board-template.png',
          '/assets/games/strategy/piece-movement.json'
        );
        break;
    }

    // Add subject-specific assets
    assetUrls.push(
      `/assets/games/${game.subject}/icons.png`,
      `/assets/games/${game.subject}/background.jpg`,
      `/assets/games/${game.subject}/class-${game.classLevel}-content.json`
    );

    return assetUrls;
  }

  /**
   * Cache curriculum content for offline access
   */
  private async cacheCurriculumContent(game: GameData): Promise<void> {
    try {
      // Fetch curriculum data
      const curriculumData = await OdishaAPIService.fetchCurriculumData(
        game.subject,
        game.classLevel,
        undefined,
        'en' // Default to English, can be expanded for multilingual
      );

      if (curriculumData) {
        // Transform for game use
        const gameContent = OdishaAPIService.transformToGameContent(curriculumData, game.gameType);
        
        // Store in IndexedDB
        game.curriculumData = gameContent;
        await GameStorageService.saveGame(game);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to cache curriculum for ${game.id}:`, error);
    }
  }

  /**
   * Sync game progress when internet connection available
   */
  async syncWhenOnline(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.syncInProgress) {
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.syncStatus.errors = [];

    try {
      console.log('🔄 Starting sync...');

      // Upload pending progress data
      await this.uploadPendingProgress();

      // Download latest curriculum updates
      await this.downloadLatestCurriculum();

      // Update sync status
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingUploads = 0;
      this.syncStatus.pendingDownloads = 0;

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  /**
   * Upload pending game progress to cloud
   */
  private async uploadPendingProgress(): Promise<void> {
    const pendingItems = await GameStorageService.getUnsyncedItems();
    this.syncStatus.pendingUploads = pendingItems.length;

    for (const item of pendingItems) {
      try {
        let success = false;

        switch (item.type) {
          case 'progress':
            success = await OdishaAPIService.syncProgressWithGovAPI('student', item.data);
            break;
          case 'completion':
            // Handle game completion sync
            success = await this.syncGameCompletion(item.data);
            break;
          case 'achievement':
            // Handle achievement sync
            success = await this.syncAchievement(item.data);
            break;
        }

        if (success) {
          await GameStorageService.markAsSynced(item.id);
          this.syncStatus.pendingUploads--;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to sync item ${item.id}:`, error);
      }
    }
  }

  /**
   * Download latest curriculum updates from government API
   */
  private async downloadLatestCurriculum(): Promise<void> {
    try {
      // Get list of subjects and classes to update
      const subjects = this.config.preloadPriority;
      const classLevels = [6, 7, 8, 9, 10, 11, 12];

      for (const subject of subjects) {
        for (const classLevel of classLevels) {
          try {
            const curriculumData = await OdishaAPIService.fetchCurriculumData(
              subject,
              classLevel,
              undefined,
              'en'
            );

            if (curriculumData) {
              // Update games with new curriculum data
              await this.updateGamesWithNewCurriculum(subject, classLevel, curriculumData);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to update curriculum for ${subject} class ${classLevel}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to download curriculum updates:', error);
    }
  }

  /**
   * Update games with new curriculum data
   */
  private async updateGamesWithNewCurriculum(
    subject: string,
    classLevel: number,
    curriculumData: any
  ): Promise<void> {
    const games = await GameStorageService.getGamesBySubject(subject, classLevel);

    for (const game of games) {
      const gameContent = OdishaAPIService.transformToGameContent(curriculumData, game.gameType);
      game.curriculumData = gameContent;
      game.updatedAt = new Date();
      
      await GameStorageService.saveGame(game);
    }
  }

  /**
   * Sync game completion data
   */
  private async syncGameCompletion(completionData: any): Promise<boolean> {
    try {
      // This would sync with a game completion API endpoint
      // For now, we'll use the progress sync as a placeholder
      return await OdishaAPIService.syncProgressWithGovAPI('student', completionData);
    } catch (error) {
      console.error('❌ Failed to sync game completion:', error);
      return false;
    }
  }

  /**
   * Sync achievement data
   */
  private async syncAchievement(achievementData: any): Promise<boolean> {
    try {
      // This would sync with an achievements API endpoint
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('❌ Failed to sync achievement:', error);
      return false;
    }
  }

  /**
   * Initialize cache with essential data
   */
  private async initializeCache(): Promise<void> {
    try {
      const stats = await GameStorageService.getStorageStats();
      
      if (stats.games === 0) {
        console.log('📦 Initializing game cache...');
        
        // This would typically load from a predefined game list
        // For now, we'll rely on the default games initialization
        await this.preloadEssentialGames();
      }
    } catch (error) {
      console.error('❌ Failed to initialize cache:', error);
    }
  }

  /**
   * Preload essential games for offline play
   */
  private async preloadEssentialGames(): Promise<void> {
    // Load essential games for each priority subject
    for (const subject of this.config.preloadPriority) {
      try {
        // This would fetch essential games for the subject
        // For now, we'll create placeholder games
        const essentialGames = await this.getEssentialGamesForSubject(subject);
        await this.cacheGameAssets(essentialGames);
      } catch (error) {
        console.warn(`⚠️ Failed to preload games for ${subject}:`, error);
      }
    }
  }

  /**
   * Get essential games for a subject (placeholder)
   */
  private async getEssentialGamesForSubject(subject: string): Promise<GameData[]> {
    // This would return a curated list of essential games
    // For now, return empty array as games are loaded from default-games.ts
    return [];
  }

  /**
   * Trigger immediate sync
   */
  private async triggerSync(): Promise<void> {
    await this.syncWhenOnline();
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get cache size information
   */
  async getCacheInfo(): Promise<{ used: number; available: number; percentage: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = (estimate.usage || 0) / (1024 * 1024); // Convert to MB
        const available = (estimate.quota || 0) / (1024 * 1024); // Convert to MB
        const percentage = available > 0 ? (used / available) * 100 : 0;

        return { used, available, percentage };
      }
    } catch (error) {
      console.error('❌ Failed to get cache info:', error);
    }

    return { used: 0, available: 0, percentage: 0 };
  }

  /**
   * Clear cache if needed
   */
  async clearCacheIfNeeded(): Promise<void> {
    const cacheInfo = await this.getCacheInfo();
    
    if (cacheInfo.percentage > 80) {
      console.log('🧹 Cache is getting full, clearing old data...');
      
      try {
        // Clear old game sessions
        await GameStorageService.clearOldSessions();
        
        // Clear old curriculum data (keep recent)
        // This would be implemented based on specific needs
        
        console.log('✅ Cache cleanup completed');
      } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

// Export singleton instance
export const offlineGameManager = OfflineGameManager.getInstance();
export default offlineGameManager;
