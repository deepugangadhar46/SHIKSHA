"use client"

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { GameStorageService, GameData, initializeDefaultGames } from '@/lib/storage/indexed-db';
import GameContainer from './GameContainer';
import { 
  Play, 
  Lock, 
  Clock, 
  Zap, 
  Trophy, 
  Star, 
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Flame
} from 'lucide-react';

interface StudentStats {
  totalXP: number;
  level: number;
  gamesCompleted: number;
  averageScore: number;
  currentStreak: number;
  totalTimeSpent: number;
  badges: string[];
}

interface SubjectProgress {
  subject: string;
  level: number;
  xp: number;
  gamesCompleted: number;
  totalGames: number;
  averageScore: number;
  unlockedGames: number;
}

export function StudentGameDashboard({ className = "" }: { className?: string }) {
  const [selectedSubject, setSelectedSubject] = useState('maths');
  const [studentGames, setStudentGames] = useState<GameData[]>([]);
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats>({
    totalXP: 0,
    level: 1,
    gamesCompleted: 0,
    averageScore: 0,
    currentStreak: 0,
    totalTimeSpent: 0,
    badges: []
  });
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Subject configurations with Odia translations
  const subjectConfigs = {
    maths: {
      icon: '🔢',
      color: 'from-blue-400 to-blue-600',
      name: {
        en: 'Mathematics',
        od: 'ଗଣିତ',
        hi: 'गणित'
      }
    },
    science: {
      icon: '🔬',
      color: 'from-green-400 to-green-600',
      name: {
        en: 'Science',
        od: 'ବିଜ୍ଞାନ',
        hi: 'विज्ञान'
      }
    },
    technology: {
      icon: '⚡',
      color: 'from-yellow-400 to-yellow-600',
      name: {
        en: 'Technology',
        od: 'ପ୍ରଯୁକ୍ତିବିଦ୍ୟା',
        hi: 'प्रौद्योगिकी'
      }
    },
    engineering: {
      icon: '🌉',
      color: 'from-orange-400 to-orange-600',
      name: {
        en: 'Engineering',
        od: 'ଇଞ୍ଜିନିୟରିଂ',
        hi: 'इंजीनियरिंग'
      }
    },
    english: {
      icon: '📚',
      color: 'from-indigo-400 to-indigo-600',
      name: {
        en: 'English',
        od: 'ଇଂରାଜୀ',
        hi: 'अंग्रेजी'
      }
    },
    odissi: {
      icon: '🏛️',
      color: 'from-pink-400 to-pink-600',
      name: {
        en: 'Odia Culture',
        od: 'ଓଡ଼ିଶୀ ସଂସ୍କୃତି',
        hi: 'ओडिया संस्कृति'
      }
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, [user]);

  // Load games when subject changes
  useEffect(() => {
    if (user) {
      loadSubjectGames(selectedSubject);
    }
  }, [selectedSubject, user]);

  const initializeData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Initialize default games if needed
      await initializeDefaultGames();
      
      // Load student stats and progress
      await loadStudentStats();
      await loadSubjectProgress();
      
      // Load initial subject games
      await loadSubjectGames(selectedSubject);
      
    } catch (error) {
      console.error('❌ Failed to initialize dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentStats = async () => {
    if (!user) return;

    try {
      const progressHistory = await GameStorageService.getStudentGameHistory(user.id);
      
      const totalXP = progressHistory.reduce((sum, p) => sum + p.xpEarned, 0);
      const level = Math.floor(totalXP / 100) + 1;
      const gamesCompleted = progressHistory.length;
      const averageScore = gamesCompleted > 0 
        ? Math.round(progressHistory.reduce((sum, p) => sum + p.score, 0) / gamesCompleted)
        : 0;
      const totalTimeSpent = progressHistory.reduce((sum, p) => sum + p.timeSpent, 0);

      setStudentStats({
        totalXP,
        level,
        gamesCompleted,
        averageScore,
        currentStreak: calculateStreak(progressHistory),
        totalTimeSpent,
        badges: [] // Will be populated based on achievements
      });
    } catch (error) {
      console.error('❌ Failed to load student stats:', error);
    }
  };

  const loadSubjectProgress = async () => {
    if (!user) return;

    try {
      const subjects = Object.keys(subjectConfigs);
      const progressData: SubjectProgress[] = [];

      for (const subject of subjects) {
        const classLevel = user.grade || 8;
        const allGames = await GameStorageService.getGamesBySubject(subject, classLevel);
        const unlockedGames = await GameStorageService.getUnlockedGames(subject, classLevel);
        
        // Get completed games for this subject
        const progressHistory = await GameStorageService.getStudentGameHistory(user.id);
        const subjectProgress = progressHistory.filter(p => 
          allGames.some(g => g.id === p.gameId)
        );

        const subjectXP = subjectProgress.reduce((sum, p) => sum + p.xpEarned, 0);
        const subjectLevel = Math.floor(subjectXP / 50) + 1;
        const averageScore = subjectProgress.length > 0
          ? Math.round(subjectProgress.reduce((sum, p) => sum + p.score, 0) / subjectProgress.length)
          : 0;

        progressData.push({
          subject,
          level: subjectLevel,
          xp: subjectXP,
          gamesCompleted: subjectProgress.length,
          totalGames: allGames.length,
          averageScore,
          unlockedGames: unlockedGames.length
        });
      }

      setSubjectProgress(progressData);
    } catch (error) {
      console.error('❌ Failed to load subject progress:', error);
    }
  };

  const loadSubjectGames = async (subject: string) => {
    if (!user) return;

    try {
      const classLevel = user.grade || 8;
      const games = await GameStorageService.getGamesBySubject(subject, classLevel);
      
      // Check unlock status for each game
      const gamesWithUnlockStatus = await Promise.all(
        games.map(async (game) => {
          const isUnlocked = await GameStorageService.checkUnlockStatus(user.id, game.id, classLevel);
          return { ...game, isUnlocked };
        })
      );

      setStudentGames(gamesWithUnlockStatus);
    } catch (error) {
      console.error('❌ Failed to load subject games:', error);
    }
  };

  const calculateStreak = (progressHistory: any[]): number => {
    // Simple streak calculation - can be made more sophisticated
    const sortedHistory = progressHistory
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const progress of sortedHistory) {
      const progressDate = new Date(progress.completedAt);
      const daysDiff = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streak++;
        currentDate = progressDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleStartGame = (game: GameData) => {
    setCurrentGame(game);
  };

  const handleGameComplete = async (score: number, xpEarned: number) => {
    // Refresh stats and progress
    await loadStudentStats();
    await loadSubjectProgress();
    await loadSubjectGames(selectedSubject);
    
    // Close game
    setCurrentGame(null);
    
    // Show completion celebration (could be enhanced)
    console.log(`🎉 Game completed! Score: ${score}, XP: ${xpEarned}`);
  };

  const handleGameExit = () => {
    setCurrentGame(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      case 'ADVANCED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    const icons = {
      'drag-drop': '🎯',
      'memory': '🧠',
      'puzzle': '🧩',
      'strategy': '♟️',
      'simulation': '🔬'
    };
    return icons[gameType as keyof typeof icons] || '🎮';
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your games...</p>
        </div>
      </div>
    );
  }

  // If a game is selected, show the game container
  if (currentGame) {
    return (
      <GameContainer
        gameData={currentGame}
        onComplete={handleGameComplete}
        onExit={handleGameExit}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Student Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {language === "od" ? "ଖେଳ ଡ୍ୟାସବୋର୍ଡ" : 
                 language === "hi" ? "गेम डैशबोर्ड" : 
                 "Game Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {language === "od" ? `ସ୍ୱାଗତ, ${user?.name || "ଛାତ୍ର"}!` : 
                 language === "hi" ? `स्वागत है, ${user?.name || "छात्र"}!` : 
                 `Welcome back, ${user?.name || "Student"}!`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{studentStats.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{studentStats.totalXP}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 flex items-center gap-1">
                <Flame className="w-5 h-5" />
                {studentStats.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <Trophy className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{studentStats.gamesCompleted}</div>
            <div className="text-xs text-muted-foreground">Games Completed</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{studentStats.averageScore}%</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 text-center">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{formatTime(studentStats.totalTimeSpent)}</div>
            <div className="text-xs text-muted-foreground">Time Played</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-3 text-center">
            <Award className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{studentStats.badges.length}</div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </div>
        </div>
      </motion.div>

      {/* Subject Tabs */}
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="space-y-6">
        <TabsList className="glass-card p-1 rounded-xl grid grid-cols-6 w-full">
          {Object.entries(subjectConfigs).map(([subject, config]) => (
            <TabsTrigger 
              key={subject}
              value={subject}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground rounded-lg px-3 py-2 flex items-center gap-2 transition-all text-sm"
            >
              <span className="text-lg">{config.icon}</span>
              <span className="hidden sm:inline">
                {config.name[language as keyof typeof config.name] || config.name.en}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(subjectConfigs).map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-6">
            {/* Subject Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">{subjectConfigs[subject as keyof typeof subjectConfigs].icon}</span>
                {subjectConfigs[subject as keyof typeof subjectConfigs].name[language as keyof typeof subjectConfigs[subject as keyof typeof subjectConfigs].name] || 
                 subjectConfigs[subject as keyof typeof subjectConfigs].name.en} Progress
              </h3>
              
              {subjectProgress.find(p => p.subject === subject) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">
                          Level {subjectProgress.find(p => p.subject === subject)?.level}
                        </div>
                        <div className="text-xs text-muted-foreground">Current Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-500">
                          {subjectProgress.find(p => p.subject === subject)?.xp} XP
                        </div>
                        <div className="text-xs text-muted-foreground">Subject XP</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {subjectProgress.find(p => p.subject === subject)?.gamesCompleted} / {subjectProgress.find(p => p.subject === subject)?.totalGames} Games Completed
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subjectProgress.find(p => p.subject === subject)?.unlockedGames} Games Unlocked
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(subjectProgress.find(p => p.subject === subject)?.gamesCompleted || 0) / 
                           (subjectProgress.find(p => p.subject === subject)?.totalGames || 1) * 100} 
                    className="h-3"
                  />
                </div>
              )}
            </motion.div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {studentGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`glass-card card-hover h-full ${!game.isUnlocked ? 'opacity-60' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getGameTypeIcon(game.gameType)}</span>
                            <Badge 
                              className={`${getDifficultyColor(game.difficulty)} text-white text-xs`}
                            >
                              {game.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{game.xpReward}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg leading-tight">{game.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {game.curriculumData?.topics?.join(', ') || 'Interactive learning game'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{game.timeEstimate}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-green-500" />
                            <span>Class {game.classLevel}</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => handleStartGame(game)}
                          disabled={!game.isUnlocked}
                        >
                          {game.isUnlocked ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Play Game
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Locked
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default StudentGameDashboard;
