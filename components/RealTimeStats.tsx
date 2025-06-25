"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, Zap, Award } from 'lucide-react';
import { GameState, GameSession } from '@/types/game';

interface RealTimeStatsProps {
  gameState: GameState;
  session: GameSession;
}

export function RealTimeStats({ gameState, session }: RealTimeStatsProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.gameStatus === 'playing') {
        setElapsedTime(Date.now() - session.startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.gameStatus, session.startTime]);

  useEffect(() => {
    const totalGuesses = gameState.guessedLetters.length;
    const correctGuesses = gameState.guessedLetters.filter(letter => 
      gameState.currentWord.includes(letter)
    ).length;
    
    if (totalGuesses > 0) {
      setAccuracy(Math.round((correctGuesses / totalGuesses) * 100));
    }
  }, [gameState.guessedLetters, gameState.currentWord]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-green-600';
    if (acc >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-yellow-500" />
          Live Game Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs text-blue-800">Time</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className={`text-lg font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy}%
            </div>
            <div className="text-xs text-green-800">Accuracy</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-600">
              {gameState.guessedLetters.length}
            </div>
            <div className="text-xs text-purple-800">Guesses</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-lg font-bold text-orange-600">
              +{session.pointsEarned}
            </div>
            <div className="text-xs text-orange-800">Points</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {gameState.currentWord.split('').filter(letter => 
                gameState.guessedLetters.includes(letter)
              ).length} / {gameState.currentWord.length} letters
            </span>
          </div>
          <Progress 
            value={(gameState.currentWord.split('').filter(letter => 
              gameState.guessedLetters.includes(letter)
            ).length / gameState.currentWord.length) * 100}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}