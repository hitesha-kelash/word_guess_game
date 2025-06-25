"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, Target, Trophy, Zap } from 'lucide-react';
import { GameState } from '@/types/game';

interface GameStatsProps {
  gameState: GameState;
  wrongLetters: string[];
}

export function GameStats({ gameState, wrongLetters }: GameStatsProps) {
  const { wrongGuesses, maxWrongGuesses } = gameState;
  const remainingGuesses = maxWrongGuesses - wrongGuesses;
  const progressValue = ((maxWrongGuesses - wrongGuesses) / maxWrongGuesses) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-red-500" />
            Remaining Guesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{remainingGuesses}</span>
              <span className="text-sm text-muted-foreground">/ {maxWrongGuesses}</span>
            </div>
            <Progress 
              value={progressValue} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-500" />
            Wrong Letters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[60px] flex flex-wrap gap-1">
            {wrongLetters.length === 0 ? (
              <span className="text-sm text-muted-foreground">None yet!</span>
            ) : (
              wrongLetters.map(letter => (
                <span
                  key={letter}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium"
                >
                  {letter.toUpperCase()}
                </span>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}