"use client"

import { useState } from 'react';
import { SimpleGameContainer } from '@/components/games/SimpleGameContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

export default function GameTestPage() {
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [gameResults, setGameResults] = useState<{score: number, xp: number} | null>(null);

  // Sample game data for testing
  const testGames = [
    {
      id: 'math-test-game',
      title: 'Math Drag & Drop Test',
      subject: 'maths',
      type: 'puzzle',
      difficulty: 'beginner',
      description: 'Test the math drag and drop game functionality',
      xpReward: 100,
      duration: 5,
      icon: '🔢',
      color: 'blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      classLevel: 8
    },
    {
      id: 'science-test-game', 
      title: 'Science Memory Test',
      subject: 'science',
      type: 'memory',
      difficulty: 'intermediate',
      description: 'Test the science memory game functionality',
      xpReward: 120,
      duration: 7,
      icon: '🔬',
      color: 'green',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      classLevel: 9
    }
  ];

  const handleGameComplete = (score: number, xpEarned: number) => {
    setGameResults({ score, xp: xpEarned });
    setTimeout(() => {
      setCurrentGame(null);
      setGameResults(null);
    }, 3000);
  };

  const handleGameExit = () => {
    setCurrentGame(null);
    setGameResults(null);
  };

  if (currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <SimpleGameContainer
          gameData={currentGame}
          onComplete={handleGameComplete}
          onExit={handleGameExit}
          className="w-full h-screen"
        />
        
        {/* Results overlay */}
        {gameResults && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white p-8 text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-green-600">🎉 Game Complete!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-2">Score: <strong>{gameResults.score}</strong></p>
                <p className="text-lg mb-4">XP Earned: <strong>{gameResults.xp}</strong></p>
                <p className="text-sm text-muted-foreground">Returning to test page...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              🎮 Game Functionality Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Test individual games to verify they launch and work correctly
            </p>
          </div>
          <Link href="/student">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Student Dashboard
            </Button>
          </Link>
        </div>

        {/* Test Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testGames.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{game.icon}</span>
                  <div>
                    <h3 className="text-xl">{game.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {game.subject} • {game.difficulty} • {game.duration} min
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{game.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="font-semibold text-yellow-600">+{game.xpReward} XP</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-blue-600">Class {game.classLevel}</span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setCurrentGame(game)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Launch Game Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Click "Launch Game Test" on any game above</p>
              <p><strong>2.</strong> The game should load with Phaser.js engine</p>
              <p><strong>3.</strong> Interact with the game (drag items, click cards, etc.)</p>
              <p><strong>4.</strong> Complete the game or use the exit button</p>
              <p><strong>5.</strong> Verify you receive XP and return to this page</p>
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Technical Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-600 mb-1">✅ Game Engine</h4>
                <p>Phaser.js v3.80.1 Ready</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-1">✅ Game Scenes</h4>
                <p>MathDragDropScene, ScienceMemoryScene</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-1">✅ Game Container</h4>
                <p>React-Phaser Integration Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
