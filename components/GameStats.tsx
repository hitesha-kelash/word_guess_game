"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { GameState } from '@/types/game';

interface GameStatsProps {
  gameState: GameState;
  wrongLetters: string[];
}

export function GameStats({ gameState, wrongLetters }: GameStatsProps) {
  const { wrongGuesses, maxWrongGuesses, guessedLetters, currentWord } = gameState;
  const remainingGuesses = maxWrongGuesses - wrongGuesses;
  const progressValue = (remainingGuesses / maxWrongGuesses) * 100;
  
  const correctLetters = guessedLetters.filter(letter => currentWord.includes(letter));
  const accuracy = guessedLetters.length > 0 ? Math.round((correctLetters.length / guessedLetters.length) * 100) : 100;

  const getHealthColor = () => {
    if (remainingGuesses > 7) return 'text-emerald-600';
    if (remainingGuesses > 4) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthBg = () => {
    if (remainingGuesses > 7) return 'from-emerald-500 to-emerald-600';
    if (remainingGuesses > 4) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className={`w-5 h-5 ${getHealthColor()}`} />
            Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-3xl font-bold ${getHealthColor()}`}>
                {remainingGuesses}
              </span>
              <span className="text-sm text-muted-foreground">
                / {maxWrongGuesses} remaining
              </span>
            </div>
            <Progress 
              value={progressValue} 
              className="h-4"
            />
            <div className="flex items-center gap-2 text-sm">
              {remainingGuesses > 7 && (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Excellent health</span>
                </>
              )}
              {remainingGuesses <= 7 && remainingGuesses > 4 && (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-700">Be careful</span>
                </>
              )}
              {remainingGuesses <= 4 && (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700">Critical condition</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-xs text-blue-800">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{guessedLetters.length}</div>
              <div className="text-xs text-purple-800">Total Guesses</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-emerald-700">Correct Letters</span>
                <span className="text-sm text-emerald-600">{correctLetters.length}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {correctLetters.length === 0 ? (
                  <span className="text-xs text-muted-foreground">None yet</span>
                ) : (
                  correctLetters.map(letter => (
                    <span
                      key={letter}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium"
                    >
                      {letter.toUpperCase()}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-red-700">Wrong Letters</span>
                <span className="text-sm text-red-600">{wrongLetters.length}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {wrongLetters.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Great job!</span>
                ) : (
                  wrongLetters.map(letter => (
                    <span
                      key={letter}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium"
                    >
                      {letter.toUpperCase()}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}