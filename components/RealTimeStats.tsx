"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, Zap, Award, TrendingUp } from 'lucide-react';
import { GameState, GameSession } from '@/types/game';
import { calculatePoints } from '@/lib/gameLogic';

interface RealTimeStatsProps {
  gameState: GameState;
  session: GameSession;
}

export function RealTimeStats({ gameState, session }: RealTimeStatsProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [potentialPoints, setPotentialPoints] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.gameStatus === 'playing') {
        setElapsedTime(Date.now() - session.startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.gameStatus, session.startTime]);

  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      const points = calculatePoints(
        gameState.currentLevel, 
        true, 
        gameState.guessedLetters.length, 
        gameState.maxWrongGuesses
      );
      setPotentialPoints(points);
    }
  }, [gameState.guessedLetters, gameState.currentLevel, gameState.maxWrongGuesses, gameState.gameStatus]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const correctGuesses = gameState.guessedLetters.filter(letter => 
    gameState.currentWord.includes(letter)
  ).length;
  
  const accuracy = gameState.guessedLetters.length > 0 
    ? Math.round((correctGuesses / gameState.guessedLetters.length) * 100) 
    : 100;

  const wordProgress = (gameState.currentWord.split('').filter(letter => 
    gameState.guessedLetters.includes(letter)
  ).length / gameState.currentWord.length) * 100;

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-emerald-600';
    if (acc >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAccuracyGradient = (acc: number) => {
    if (acc >= 80) return 'from-emerald-500 to-emerald-600';
    if (acc >= 60) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-indigo-600" />
          Live Performance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-600">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs text-blue-800 font-medium">Time Elapsed</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <div className={`text-xl font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy}%
            </div>
            <div className="text-xs text-emerald-800 font-medium">Accuracy</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-600">
              {gameState.guessedLetters.length}
            </div>
            <div className="text-xs text-purple-800 font-medium">Total Guesses</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
            <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-amber-600">
              +{potentialPoints}
            </div>
            <div className="text-xs text-amber-800 font-medium">Potential Points</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border border-rose-200">
            <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{Math.round(wordProgress)}%</span>
            </div>
            <div className="text-xl font-bold text-rose-600">
              {Math.round(wordProgress)}%
            </div>
            <div className="text-xs text-rose-800 font-medium">Word Progress</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Word Completion</span>
              <span className="text-sm text-slate-500">
                {gameState.currentWord.split('').filter(letter => 
                  gameState.guessedLetters.includes(letter)
                ).length} / {gameState.currentWord.length} letters found
              </span>
            </div>
            <Progress 
              value={wordProgress}
              className="h-3"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Accuracy Rate</span>
              <span className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
                {correctGuesses} correct out of {gameState.guessedLetters.length} guesses
              </span>
            </div>
            <Progress 
              value={accuracy}
              className="h-3"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}