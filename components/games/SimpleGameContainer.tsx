"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

// Math Game Component
interface MathEquation {
  left: number;
  operator: string;
  right: number | null;
  answer: number;
  correctAnswer: number;
}

const EquationQuestGame = ({ 
  gameData, 
  onScoreUpdate, 
  onComplete 
}: { 
  gameData: any; 
  onScoreUpdate: (score: number) => void;
  onComplete: () => void;
}) => {
  const [currentEquation, setCurrentEquation] = useState<MathEquation | null>(null);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [gameScore, setGameScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [draggedNumber, setDraggedNumber] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const generateNewEquation = () => {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    const left = Math.floor(Math.random() * 10) + 1;
    const answer = Math.floor(Math.random() * 15) + 5;
    const correctAnswer = op === '+' ? answer - left : left - answer;
    
    // Ensure positive results for subtraction
    if (op === '-' && correctAnswer < 0) {
      const newLeft = answer + Math.abs(correctAnswer);
      setCurrentEquation({ 
        left: newLeft, 
        operator: op, 
        right: null, 
        answer, 
        correctAnswer: newLeft - answer 
      });
    } else {
      setCurrentEquation({ left, operator: op, right: null, answer, correctAnswer });
    }
    
    // Generate random numbers including the correct answer
    const wrongNumbers = Array.from({length: 5}, () => Math.floor(Math.random() * 15) + 1);
    const allNumbers = [...wrongNumbers, correctAnswer].sort(() => Math.random() - 0.5);
    setAvailableNumbers(allNumbers);
  };

  const handleDrop = (droppedNumber: number) => {
    if (!currentEquation) return;
    
    setCurrentEquation(prev => prev ? { ...prev, right: droppedNumber } : null);
    
    if (droppedNumber === currentEquation.correctAnswer) {
      const points = 10;
      setGameScore(prev => prev + points);
      setFeedback(`🎉 Correct! +${points} points`);
      setShowFeedback(true);
      onScoreUpdate(gameScore + points);
      
      setTimeout(() => {
        setQuestionsAnswered(prev => prev + 1);
        if (questionsAnswered + 1 >= 10) {
          onComplete();
        } else {
          generateNewEquation();
          setShowFeedback(false);
        }
      }, 1500);
    } else {
      setFeedback(`❌ Try again! The answer is ${currentEquation.correctAnswer}`);
      setShowFeedback(true);
      setTimeout(() => {
        setCurrentEquation(prev => prev ? { ...prev, right: null } : null);
        setShowFeedback(false);
      }, 2000);
    }
  };

  useEffect(() => {
    generateNewEquation();
  }, []);

  if (!currentEquation) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-white">
      {/* Game Progress */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">🧮 Equation Quest</h2>
        <p className="text-gray-300">Question {questionsAnswered + 1} of 10</p>
        <div className="w-64 bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((questionsAnswered) / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Equation Display */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-2xl border-2 border-purple-400/50">
        <div className="text-4xl font-bold text-yellow-300">{currentEquation.left}</div>
        <div className="text-4xl font-bold text-white">{currentEquation.operator}</div>
        <div 
          className="min-w-[80px] min-h-[80px] bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-dashed border-red-400 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-300 hover:scale-105 hover:bg-red-500/30"
          onDrop={(e) => {
            e.preventDefault();
            const number = parseInt(e.dataTransfer.getData('number'));
            handleDrop(number);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {currentEquation.right !== null ? currentEquation.right : '?'}
        </div>
        <div className="text-4xl font-bold text-white">=</div>
        <div className="text-4xl font-bold text-green-300">{currentEquation.answer}</div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="mb-6 p-4 bg-black/50 rounded-lg text-center">
          <p className="text-lg font-semibold">{feedback}</p>
        </div>
      )}

      {/* Draggable Numbers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-200">
          🎯 Drag the correct number to complete the equation:
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {availableNumbers.map((number, index) => (
            <div
              key={`${number}-${index}`}
              className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-xl font-bold cursor-grab hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('number', number.toString());
                setDraggedNumber(number);
              }}
              onDragEnd={() => setDraggedNumber(null)}
              style={{
                opacity: draggedNumber === number ? 0.5 : 1,
                transform: draggedNumber === number ? 'scale(0.9)' : 'scale(1)'
              }}
            >
              {number}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-400 text-sm">
        <p className="mb-1">🎮 Drag numbers to the ? box to solve equations</p>
        <p className="mb-1">⚡ +10 points for each correct answer</p>
        <p>🏆 Complete 10 equations to finish the game!</p>
      </div>
    </div>
  );
};

interface SimpleGameContainerProps {
  gameData: any;
  onComplete: (score: number, xpEarned: number) => void;
  onExit: () => void;
  className?: string;
}

export function SimpleGameContainer({ gameData, onComplete, onExit, className = "" }: SimpleGameContainerProps) {
  const [gameState, setGameState] = useState({
    isLoading: true,
    isPlaying: false,
    currentScore: 0,
    timeElapsed: 0,
    gameProgress: 0,
    gameStarted: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate game loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }, 3000); // 3 seconds loading

    return () => clearTimeout(loadTimer);
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState.isPlaying) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
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
  }, [gameState.isPlaying]);

  const handleScoreUpdate = (newScore: number) => {
    setGameState(prev => ({ 
      ...prev, 
      currentScore: newScore,
      gameProgress: Math.min((newScore / 100) * 100, 100)
    }));
  };

  const handleGameComplete = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    setTimeout(() => {
      onComplete(gameState.currentScore, gameData.xpReward || 100);
    }, 1000);
  };

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true, gameStarted: true }));
  };

  const handlePauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
  };

  const handleRestartGame = () => {
    setGameState({
      isLoading: false,
      isPlaying: false,
      currentScore: 0,
      timeElapsed: 0,
      gameProgress: 0,
      gameStarted: false,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Game Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div>
              <h2 className="text-xl font-bold">{gameData.title}</h2>
              <p className="text-sm text-gray-300">{gameData.subject} • {gameData.difficulty}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{gameState.currentScore}</div>
              <div className="text-xs text-gray-300">SCORE</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono">{formatTime(gameState.timeElapsed)}</div>
              <div className="text-xs text-gray-300">TIME</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{gameState.gameProgress}%</div>
              <div className="text-xs text-gray-300">PROGRESS</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={gameState.gameProgress} className="h-2" />
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 relative">
        {gameState.isLoading ? (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Loading {gameData.title}...</h3>
              <p className="text-gray-300">Preparing your {gameData.subject} adventure</p>
            </div>
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 relative">
            {/* Game Canvas Area */}
            <div className="w-full h-full flex items-center justify-center">
              {!gameState.isPlaying ? (
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">{gameData.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{gameData.title}</h3>
                  <p className="text-gray-300 mb-6 max-w-md">{gameData.description}</p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleStartGame}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </Button>
                    <Button
                      onClick={handleRestartGame}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <EquationQuestGame
                  gameData={gameData}
                  onScoreUpdate={handleScoreUpdate}
                  onComplete={handleGameComplete}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
