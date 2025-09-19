"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { GameStorageService, GameData, initializeDefaultGames } from '@/lib/storage/indexed-db';
import GameProgressionSystem from '@/lib/gamification/progression-system';
import StudentGameDashboard from '../games/StudentGameDashboard';
import { CelebrationSystem } from '../gamification/celebration-system';
import { 
  Play, 
  Trophy, 
  Star, 
  Zap, 
  Clock, 
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Flame,
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface GameIntegratedLessonProps {
  className?: string;
}

interface QuickStats {
  totalXP: number;
  level: number;
  gamesCompleted: number;
  currentStreak: number;
  averageScore: number;
  timeSpent: number;
  badges: number;
}

interface RecentAchievement {
  id: string;
  name: string;
  icon: string;
  xpReward: number;
  unlockedAt: Date;
}

export function GameIntegratedLesson({ className = "" }: GameIntegratedLessonProps) {
  const [viewMode, setViewMode] = useState<'dashboard' | 'games'>('dashboard');
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalXP: 0,
    level: 1,
    gamesCompleted: 0,
    currentStreak: 0,
    averageScore: 0,
    timeSpent: 0,
    badges: 0
  });
  const [recommendedGames, setRecommendedGames] = useState<GameData[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  const { language, t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeGameSystem();
    }
  }, [user]);

  const initializeGameSystem = async () => {
    try {
      setIsLoading(true);
      
      // Initialize default games
      await initializeDefaultGames();
      
      // Load student progress and stats
      await loadQuickStats();
      await loadRecommendedGames();
      await loadRecentAchievements();
      
    } catch (error) {
      console.error('❌ Failed to initialize game system:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickStats = async () => {
    if (!user) return;

    try {
      const progressHistory = await GameStorageService.getStudentGameHistory(user.id);
      const studentLevel = GameProgressionSystem.calculateStudentLevel(
        progressHistory.reduce((sum, p) => sum + p.xpEarned, 0)
      );

      const stats: QuickStats = {
        totalXP: studentLevel.totalXP,
        level: studentLevel.level,
        gamesCompleted: progressHistory.length,
        currentStreak: await calculateCurrentStreak(progressHistory),
        averageScore: progressHistory.length > 0 
          ? Math.round(progressHistory.reduce((sum, p) => sum + p.score, 0) / progressHistory.length)
          : 0,
        timeSpent: progressHistory.reduce((sum, p) => sum + p.timeSpent, 0),
        badges: 0 // Will be updated when achievements are loaded
      };

      setQuickStats(stats);
    } catch (error) {
      console.error('❌ Failed to load quick stats:', error);
    }
  };

  const loadRecommendedGames = async () => {
    if (!user) return;

    try {
      const recommended = await GameProgressionSystem.getRecommendedGames(
        user.id,
        user.grade || 8,
        4
      );
      setRecommendedGames(recommended);
    } catch (error) {
      console.error('❌ Failed to load recommended games:', error);
    }
  };

  const loadRecentAchievements = async () => {
    if (!user) return;

    try {
      const progressHistory = await GameStorageService.getStudentGameHistory(user.id);
      const achievements = await GameProgressionSystem.checkAndAwardAchievements(user.id, progressHistory);
      
      // Convert to RecentAchievement format and take most recent 3
      const recentAchievements = achievements
        .slice(-3)
        .map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          unlockedAt: achievement.unlockedAt || new Date()
        }));

      setRecentAchievements(recentAchievements);
      setQuickStats(prev => ({ ...prev, badges: achievements.length }));
    } catch (error) {
      console.error('❌ Failed to load recent achievements:', error);
    }
  };

  const calculateCurrentStreak = async (progressHistory: any[]): Promise<number> => {
    if (progressHistory.length === 0) return 0;

    const sortedHistory = [...progressHistory].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const progress of sortedHistory) {
      const progressDate = new Date(progress.completedAt);
      progressDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0 || daysDiff === 1) {
        streak++;
        currentDate = progressDate;
      } else if (daysDiff > 1) {
        break;
      }
    }

    return streak;
  };

  const handleGameComplete = async (score: number, xpEarned: number) => {
    // Show celebration
    setCelebrationData({
      type: 'game_complete',
      score,
      xpEarned,
      newLevel: quickStats.level + Math.floor((quickStats.totalXP + xpEarned) / 100) > quickStats.level
    });
    setShowCelebration(true);

    // Refresh stats
    await loadQuickStats();
    await loadRecommendedGames();
    await loadRecentAchievements();
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-red-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getGameTypeIcon = (gameType: string): string => {
    const icons = {
      'drag-drop': '🎯',
      'memory': '🧠',
      'puzzle': '🧩',
      'strategy': '♟️',
      'simulation': '🔬'
    };
    return icons[gameType as keyof typeof icons] || '🎮';
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      case 'ADVANCED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  // If games view is selected, show the full game dashboard
  if (viewMode === 'games') {
    return (
      <div className={className}>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <StudentGameDashboard />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Celebration System */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <CelebrationSystem
            type={celebrationData.type}
            data={celebrationData}
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      {/* Header with Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {language === "od" ? "ଶିକ୍ଷା ଯାତ୍ରା" : 
                 language === "hi" ? "शिक्षा यात्रा" : 
                 "Learning Journey"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {language === "od" ? `ସ୍ୱାଗତ, ${user?.name || "ଛାତ୍ର"}!` : 
                 language === "hi" ? `स्वागत है, ${user?.name || "छात्र"}!` : 
                 `Welcome back, ${user?.name || "Student"}!`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{quickStats.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{quickStats.totalXP}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold flex items-center gap-1 ${getStreakColor(quickStats.currentStreak)}`}>
                <Flame className="w-8 h-8" />
                {quickStats.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Level {quickStats.level} Progress</span>
            <span className="text-sm text-muted-foreground">
              {quickStats.totalXP % 100}/100 XP
            </span>
          </div>
          <Progress value={(quickStats.totalXP % 100)} className="h-3" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-semibold">{quickStats.gamesCompleted}</div>
            <div className="text-xs text-muted-foreground">Games Completed</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-semibold">{quickStats.averageScore}%</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-semibold">{formatTime(quickStats.timeSpent)}</div>
            <div className="text-xs text-muted-foreground">Time Played</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-semibold">{quickStats.badges}</div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </div>
          <div className="bg-pink-500/10 rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-semibold">
              {GameProgressionSystem.calculateStudentLevel(quickStats.totalXP).title}
            </div>
            <div className="text-xs text-muted-foreground">Current Title</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="glass-card p-1 rounded-xl grid grid-cols-4 w-full">
          <TabsTrigger value="recommended" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Star className="w-4 h-4 mr-2" />
            Recommended
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Play className="w-4 h-4 mr-2" />
            All Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {/* Recommended Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">🎯 Recommended for You</h3>
              <Button 
                variant="outline" 
                onClick={() => setViewMode('games')}
                className="flex items-center gap-2"
              >
                View All Games
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card card-hover h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{getGameTypeIcon(game.gameType)}</span>
                        <Badge className={`${getDifficultyColor(game.difficulty)} text-white text-xs`}>
                          {game.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{game.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{game.timeEstimate}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span>{game.xpReward} XP</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => setViewMode('games')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4">🏆 Recent Achievements</h3>
            
            {recentAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg p-4 text-center border border-yellow-400/30"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-lg">{achievement.name}</h4>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">+{achievement.xpReward} XP</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete games to unlock achievements!
                </p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4">📈 Learning Progress</h3>
            
            <div className="space-y-6">
              {/* Level Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Level Progress</span>
                  <span className="text-sm text-muted-foreground">
                    Level {quickStats.level} → {quickStats.level + 1}
                  </span>
                </div>
                <Progress value={(quickStats.totalXP % 100)} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{quickStats.totalXP % 100} XP</span>
                  <span>100 XP</span>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{quickStats.gamesCompleted}</div>
                  <div className="text-sm text-muted-foreground">Games Completed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{quickStats.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{quickStats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">{formatTime(quickStats.timeSpent)}</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="games">
          <Button 
            onClick={() => setViewMode('games')}
            className="w-full h-16 text-lg"
          >
            <Play className="w-6 h-6 mr-3" />
            Open Full Game Dashboard
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GameIntegratedLesson;
