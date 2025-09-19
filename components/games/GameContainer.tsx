"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { GameStorageService, GameData } from '@/lib/storage/indexed-db';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  Trophy, 
  Clock, 
  Zap,
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

// Phaser.js will be loaded dynamically to avoid SSR issues
let Phaser: any = null;

// Import game scenes
import { MathDragDropScene } from './scenes/MathDragDropScene';
import { ScienceMemoryScene } from './scenes/ScienceMemoryScene';

// Game scene selector
const getGameScene = (gameType: string, subject: string, classLevel: number | string) => {
  switch (subject) {
    case 'maths':
    case 'mathematics':
      return MathDragDropScene;
    case 'science':
      return ScienceMemoryScene;
    default:
      // Default to math scene for other subjects
      return MathDragDropScene;
  }
};

interface GameContainerProps {
  gameData: GameData;
  onComplete: (score: number, xpEarned: number) => void;
  onExit: () => void;
  className?: string;
}

interface GameState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentScore: number;
  timeElapsed: number;
  hintsUsed: number;
  mistakes: number;
  gameProgress: number;
}

export function GameContainer({ gameData, onComplete, onExit, className = "" }: GameContainerProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    currentScore: 0,
    timeElapsed: 0,
    hintsUsed: 0,
    mistakes: 0,
    gameProgress: 0
  });
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Load Phaser.js dynamically
  useEffect(() => {
    const loadPhaser = async () => {
      if (!Phaser) {
        try {
          Phaser = (await import('phaser')).default;
          console.log('✅ Phaser.js loaded successfully');
        } catch (error) {
          console.error('❌ Failed to load Phaser.js:', error);
        }
      }
    };
    
    loadPhaser();
  }, []);

  // Initialize game when Phaser is loaded
  useEffect(() => {
    if (Phaser && gameRef.current && !gameInstanceRef.current) {
      initializeGame();
    }
    
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [Phaser, gameData]);

  // Game timer
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused]);

  const initializeGame = useCallback(() => {
    if (!Phaser || !gameRef.current) return;

    const config: any = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: getGameScene(gameData.type || 'puzzle', gameData.subject, gameData.classLevel || 8),
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
      }
    };

    try {
      gameInstanceRef.current = new Phaser.Game(config);
      
      // Setup game event listeners
      setupGameEventListeners();
      
      setGameState(prev => ({ ...prev, isLoading: false }));
      console.log('✅ Game initialized:', gameData.title);
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [gameData]);

  const setupGameEventListeners = () => {
    if (!gameInstanceRef.current) return;

    // Listen for game events from Phaser scenes
    gameInstanceRef.current.events.on('game-started', () => {
      setGameState(prev => ({ ...prev, isPlaying: true }));
    });

    gameInstanceRef.current.events.on('game-paused', () => {
      setGameState(prev => ({ ...prev, isPaused: true }));
    });

    gameInstanceRef.current.events.on('game-resumed', () => {
      setGameState(prev => ({ ...prev, isPaused: false }));
    });

    gameInstanceRef.current.events.on('score-updated', (score: number) => {
      setGameState(prev => ({ ...prev, currentScore: score }));
    });

    gameInstanceRef.current.events.on('progress-updated', (progress: number) => {
      setGameState(prev => ({ ...prev, gameProgress: progress }));
    });

    gameInstanceRef.current.events.on('hint-used', () => {
      setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    });

    gameInstanceRef.current.events.on('mistake-made', () => {
      setGameState(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
    });

    gameInstanceRef.current.events.on('game-completed', async (finalScore: number) => {
      const xpEarned = calculateXP(finalScore, gameState.timeElapsed, gameState.hintsUsed);
      
      // Save progress to IndexedDB
      await saveGameProgress(finalScore, xpEarned);
      
      // Call completion callback
      onComplete(finalScore, xpEarned);
    });
  };

  const calculateXP = (score: number, timeSpent: number, hintsUsed: number): number => {
    const baseXP = gameData.xpReward;
    const scoreMultiplier = score / 100;
    const timeBonus = Math.max(0, (gameData.timeEstimate * 60 - timeSpent) / 60) * 5;
    const hintPenalty = hintsUsed * 10;
    
    return Math.round(baseXP * scoreMultiplier + timeBonus - hintPenalty);
  };

  const saveGameProgress = async (score: number, xpEarned: number) => {
    if (!user) return;

    try {
      await GameStorageService.saveProgress({
        id: `${user.id}_${gameData.id}_${Date.now()}`,
        studentId: user.id,
        gameId: gameData.id,
        score,
        timeSpent: gameState.timeElapsed,
        completedAt: new Date(),
        attempts: 1, // This should be incremented based on existing attempts
        bestScore: score, // This should be compared with existing best score
        xpEarned,
        hintsUsed: gameState.hintsUsed,
        mistakes: gameState.mistakes
      });
      
      console.log('✅ Game progress saved to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to save game progress:', error);
    }
  };

  const handleStartGame = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('start-game');
      setShowInstructions(false);
    }
  };

  const handlePauseGame = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('pause-game');
    }
  };

  const handleResumeGame = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('resume-game');
    }
  };

  const handleRestartGame = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('restart-game');
      setGameState(prev => ({
        ...prev,
        currentScore: 0,
        timeElapsed: 0,
        hintsUsed: 0,
        mistakes: 0,
        gameProgress: 0
      }));
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit('toggle-sound', !soundEnabled);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState.isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading {gameData.title}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Game Header */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getGameTypeIcon(gameData.gameType)}</div>
              <div>
                <CardTitle className="text-lg">{gameData.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {gameData.subject.charAt(0).toUpperCase() + gameData.subject.slice(1)} • 
                  Class {gameData.classLevel} • 
                  {gameData.difficulty}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {gameData.xpReward} XP
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {gameData.timeEstimate}m
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats Bar */}
      <Card className="glass-card">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{gameState.currentScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{formatTime(gameState.timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{gameState.hintsUsed}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSound}
                className="p-2"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              {gameState.isPlaying && !gameState.isPaused && (
                <Button variant="outline" size="sm" onClick={handlePauseGame}>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              )}
              
              {gameState.isPaused && (
                <Button variant="outline" size="sm" onClick={handleResumeGame}>
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handleRestartGame}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
              
              <Button variant="outline" size="sm" onClick={onExit}>
                <Home className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>
          
          {gameState.gameProgress > 0 && (
            <div className="mt-3">
              <Progress value={gameState.gameProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border rounded-lg p-6 max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-3">{gameData.title}</h3>
              <p className="text-muted-foreground mb-4">{gameData.description || getGameInstructions(gameData.gameType)}</p>
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setShowInstructions(false)}>
                  Skip
                </Button>
                <Button onClick={handleStartGame}>
                  <Play className="w-4 h-4 mr-1" />
                  Start Game
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Canvas Container */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={gameRef} 
            className="w-full h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg"
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getGameTypeIcon(gameType: string): string {
  const icons = {
    'drag-drop': '🎯',
    'memory': '🧠',
    'puzzle': '🧩',
    'strategy': '♟️',
    'simulation': '🔬'
  };
  return icons[gameType as keyof typeof icons] || '🎮';
}

function getGameInstructions(gameType: string): string {
  const instructions = {
    'drag-drop': 'Drag and drop items to their correct positions. Complete all matches to win!',
    'memory': 'Flip cards to find matching pairs. Remember the positions and match all pairs!',
    'puzzle': 'Solve the puzzle by arranging pieces in the correct order or pattern.',
    'strategy': 'Plan your moves carefully to achieve the objective. Think ahead!',
    'simulation': 'Experiment and observe the results. Learn through hands-on experience!'
  };
  return instructions[gameType as keyof typeof instructions] || 'Follow the on-screen instructions to play the game.';
}
