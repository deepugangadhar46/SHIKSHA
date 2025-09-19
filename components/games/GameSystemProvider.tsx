"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GameStorageService, GameData, StudentProgress, initializeDefaultGames } from '@/lib/storage/indexed-db';
import GameProgressionSystem, { StudentLevel, Achievement } from '@/lib/gamification/progression-system';
import { offlineGameManager } from '@/lib/offline/offline-game-manager';
import { useAuth } from '@/contexts/auth-context';

// Game System Context Types
interface GameSystemContextType {
  // Student Data
  studentLevel: StudentLevel;
  studentProgress: StudentProgress[];
  achievements: Achievement[];
  
  // Game Management
  availableGames: GameData[];
  recommendedGames: GameData[];
  currentGame: GameData | null;
  
  // System Status
  isInitialized: boolean;
  isOffline: boolean;
  syncStatus: any;
  
  // Actions
  startGame: (gameId: string) => Promise<void>;
  completeGame: (gameId: string, score: number, timeSpent: number, hintsUsed: number) => Promise<void>;
  refreshData: () => Promise<void>;
  getGameUnlockStatus: (gameId: string) => Promise<boolean>;
  
  // Statistics
  getSubjectMastery: (subject: string) => Promise<any>;
  getRecentAchievements: () => Achievement[];
  calculateXPReward: (gameData: any, performance: any) => number;
}

const GameSystemContext = createContext<GameSystemContextType | undefined>(undefined);

interface GameSystemProviderProps {
  children: ReactNode;
}

export function GameSystemProvider({ children }: GameSystemProviderProps) {
  // State Management
  const [studentLevel, setStudentLevel] = useState<StudentLevel>({
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    title: 'Beginner',
    benefits: []
  });
  
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [availableGames, setAvailableGames] = useState<GameData[]>([]);
  const [recommendedGames, setRecommendedGames] = useState<GameData[]>([]);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(offlineGameManager.getSyncStatus());

  const { user } = useAuth();

  // Initialize Game System
  useEffect(() => {
    if (user) {
      initializeGameSystem();
    }
  }, [user]);

  // Network Status Monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Status Monitoring
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncStatus(offlineGameManager.getSyncStatus());
    }, 5000);
    
    return () => clearInterval(syncInterval);
  }, []);

  const initializeGameSystem = async () => {
    try {
      console.log('🎮 Initializing Game System...');
      
      // Initialize default games
      await initializeDefaultGames();
      
      // Load student data
      await loadStudentData();
      
      // Initialize offline manager
      await offlineGameManager.syncWhenOnline();
      
      setIsInitialized(true);
      console.log('✅ Game System initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize game system:', error);
      setIsInitialized(true); // Set to true anyway to allow partial functionality
    }
  };

  const loadStudentData = async () => {
    if (!user) return;

    try {
      // Load student progress
      const progress = await GameStorageService.getStudentGameHistory(user.id);
      setStudentProgress(progress);

      // Calculate student level
      const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0);
      const level = GameProgressionSystem.calculateStudentLevel(totalXP);
      setStudentLevel(level);

      // Load achievements
      const studentAchievements = await GameProgressionSystem.checkAndAwardAchievements(user.id, progress);
      setAchievements(studentAchievements);

      // Load available games
      await loadAvailableGames();

      // Load recommended games
      const recommended = await GameProgressionSystem.getRecommendedGames(user.id, user.grade || 8, 6);
      setRecommendedGames(recommended);

    } catch (error) {
      console.error('❌ Failed to load student data:', error);
    }
  };

  const loadAvailableGames = async () => {
    if (!user) return;

    try {
      const subjects = ['maths', 'science', 'technology', 'engineering', 'english', 'odissi'];
      const allGames: GameData[] = [];
      
      for (const subject of subjects) {
        const subjectGames = await GameStorageService.getGamesBySubject(subject, user.grade || 8);
        
        // Check unlock status for each game
        for (const game of subjectGames) {
          const isUnlocked = await GameStorageService.checkUnlockStatus(user.id, game.id, user.grade || 8);
          game.isUnlocked = isUnlocked;
        }
        
        allGames.push(...subjectGames);
      }
      
      setAvailableGames(allGames);
    } catch (error) {
      console.error('❌ Failed to load available games:', error);
    }
  };

  const startGame = async (gameId: string) => {
    try {
      const game = availableGames.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      if (!game.isUnlocked) {
        throw new Error('Game is locked');
      }

      setCurrentGame(game);
      
      // Log game start event
      console.log(`🎮 Starting game: ${game.title}`);
      
    } catch (error) {
      console.error('❌ Failed to start game:', error);
      throw error;
    }
  };

  const completeGame = async (
    gameId: string, 
    score: number, 
    timeSpent: number, 
    hintsUsed: number
  ) => {
    if (!user) return;

    try {
      const game = availableGames.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Calculate XP reward
      const xpEarned = GameProgressionSystem.calculateXPReward(
        game.xpReward,
        score,
        timeSpent,
        game.timeEstimate * 60, // Convert to seconds
        hintsUsed,
        game.difficulty,
        !studentProgress.some(p => p.gameId === gameId), // First completion
        studentLevel.level
      );

      // Save progress
      const progressRecord: StudentProgress = {
        id: `${user.id}_${gameId}_${Date.now()}`,
        studentId: user.id,
        gameId,
        score,
        timeSpent,
        completedAt: new Date(),
        attempts: 1, // This should be calculated based on existing attempts
        bestScore: score, // This should be compared with existing best score
        xpEarned,
        hintsUsed,
        mistakes: 0 // This should be passed from the game
      };

      await GameStorageService.saveProgress(progressRecord);

      // Refresh student data
      await loadStudentData();

      // Clear current game
      setCurrentGame(null);

      console.log(`✅ Game completed: ${game.title}, Score: ${score}%, XP: ${xpEarned}`);

    } catch (error) {
      console.error('❌ Failed to complete game:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      await loadStudentData();
      await offlineGameManager.syncWhenOnline();
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  };

  const getGameUnlockStatus = async (gameId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await GameStorageService.checkUnlockStatus(user.id, gameId, user.grade || 8);
    } catch (error) {
      console.error('❌ Failed to check unlock status:', error);
      return false;
    }
  };

  const getSubjectMastery = async (subject: string) => {
    if (!user) return null;
    
    try {
      return await GameProgressionSystem.calculateSubjectMastery(subject, studentProgress);
    } catch (error) {
      console.error('❌ Failed to get subject mastery:', error);
      return null;
    }
  };

  const getRecentAchievements = (): Achievement[] => {
    return achievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 5);
  };

  const calculateXPReward = (gameData: any, performance: any): number => {
    return GameProgressionSystem.calculateXPReward(
      gameData.xpReward,
      performance.score,
      performance.timeSpent,
      gameData.timeEstimate * 60,
      performance.hintsUsed,
      gameData.difficulty,
      performance.isFirstCompletion,
      studentLevel.level
    );
  };

  // Context Value
  const contextValue: GameSystemContextType = {
    // Student Data
    studentLevel,
    studentProgress,
    achievements,
    
    // Game Management
    availableGames,
    recommendedGames,
    currentGame,
    
    // System Status
    isInitialized,
    isOffline,
    syncStatus,
    
    // Actions
    startGame,
    completeGame,
    refreshData,
    getGameUnlockStatus,
    
    // Statistics
    getSubjectMastery,
    getRecentAchievements,
    calculateXPReward
  };

  return (
    <GameSystemContext.Provider value={contextValue}>
      {children}
    </GameSystemContext.Provider>
  );
}

// Custom Hook
export function useGameSystem() {
  const context = useContext(GameSystemContext);
  if (context === undefined) {
    throw new Error('useGameSystem must be used within a GameSystemProvider');
  }
  return context;
}

// Higher-Order Component for Game System Integration
export function withGameSystem<P extends object>(Component: React.ComponentType<P>) {
  return function GameSystemWrappedComponent(props: P) {
    return (
      <GameSystemProvider>
        <Component {...props} />
      </GameSystemProvider>
    );
  };
}

// Game System Status Component
export function GameSystemStatus() {
  const { isInitialized, isOffline, syncStatus } = useGameSystem();

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        <span>Initializing game system...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Online/Offline Status */}
      <div className={`flex items-center gap-1 ${isOffline ? 'text-orange-500' : 'text-green-500'}`}>
        <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-orange-500' : 'bg-green-500'}`} />
        <span>{isOffline ? 'Offline' : 'Online'}</span>
      </div>

      {/* Sync Status */}
      {syncStatus.syncInProgress && (
        <div className="flex items-center gap-1 text-blue-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500" />
          <span>Syncing...</span>
        </div>
      )}

      {/* Pending Items */}
      {(syncStatus.pendingUploads > 0 || syncStatus.pendingDownloads > 0) && (
        <div className="text-yellow-500">
          <span>{syncStatus.pendingUploads + syncStatus.pendingDownloads} pending</span>
        </div>
      )}

      {/* Errors */}
      {syncStatus.errors.length > 0 && (
        <div className="text-red-500">
          <span>{syncStatus.errors.length} errors</span>
        </div>
      )}
    </div>
  );
}

export default GameSystemProvider;
