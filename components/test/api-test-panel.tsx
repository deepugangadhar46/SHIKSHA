"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { gameApiService } from '@/lib/services/game-api-service';
import { CheckCircle, XCircle, Loader2, Play, Database, Trophy } from 'lucide-react';

export function ApiTestPanel() {
  const [tests, setTests] = useState({
    health: { status: 'pending', data: null, error: null },
    games: { status: 'pending', data: null, error: null },
    stats: { status: 'pending', data: null, error: null },
    achievements: { status: 'pending', data: null, error: null },
  });

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status: 'running', data: null, error: null }
    }));

    try {
      const result = await testFn();
      setTests(prev => ({
        ...prev,
        [testName]: { 
          status: result.success ? 'success' : 'error', 
          data: result.data, 
          error: result.error 
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        [testName]: { 
          status: 'error', 
          data: null, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }));
    }
  };

  const runAllTests = async () => {
    await runTest('health', () => gameApiService.checkHealth());
    await runTest('games', () => gameApiService.getGames());
    await runTest('stats', () => gameApiService.getStudentStats());
    await runTest('achievements', () => gameApiService.getAchievements());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  useEffect(() => {
    // Auto-run tests on mount
    runAllTests();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 API Integration Test Panel
          <Button onClick={runAllTests} size="sm" variant="outline">
            Run All Tests
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Check */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(tests.health.status)}
            <div>
              <h3 className="font-semibold">Health Check</h3>
              <p className="text-sm text-muted-foreground">API connectivity test</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(tests.health.status)}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => runTest('health', () => gameApiService.checkHealth())}
            >
              Test
            </Button>
          </div>
        </div>

        {/* Games API */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(tests.games.status)}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Play className="w-4 h-4" />
                Games API
              </h3>
              <p className="text-sm text-muted-foreground">
                {tests.games.data?.games ? 
                  `Found ${tests.games.data.games.length} games` : 
                  'Load available games'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(tests.games.status)}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => runTest('games', () => gameApiService.getGames())}
            >
              Test
            </Button>
          </div>
        </div>

        {/* Student Stats */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(tests.stats.status)}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Database className="w-4 h-4" />
                Student Stats
              </h3>
              <p className="text-sm text-muted-foreground">
                {tests.stats.data?.stats ? 
                  `Level ${tests.stats.data.stats.level} - ${tests.stats.data.stats.total_points} XP` : 
                  'Load student statistics'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(tests.stats.status)}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => runTest('stats', () => gameApiService.getStudentStats())}
            >
              Test
            </Button>
          </div>
        </div>

        {/* Achievements */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(tests.achievements.status)}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </h3>
              <p className="text-sm text-muted-foreground">
                {tests.achievements.data?.achievements ? 
                  `Found ${tests.achievements.data.achievements.length} achievements` : 
                  'Load achievement system'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(tests.achievements.status)}
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => runTest('achievements', () => gameApiService.getAchievements())}
            >
              Test
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {Object.values(tests).some(test => test.error) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
            {Object.entries(tests).map(([name, test]) => 
              test.error && (
                <div key={name} className="text-sm text-red-700">
                  <strong>{name}:</strong> {test.error}
                </div>
              )
            )}
          </div>
        )}

        {/* Success Summary */}
        {Object.values(tests).every(test => test.status === 'success') && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              All Tests Passed! 🎉
            </h4>
            <p className="text-sm text-green-700 mt-1">
              Your game integration system is fully operational and ready for students!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
