"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, ArrowUp, Gift } from 'lucide-react';
import { GameState, DifficultyLevel } from '@/types/game';
import { DIFFICULTY_LABELS, getNextLevel } from '@/lib/gameLogic';

interface GameOverProps {
  gameState: GameState;
  onNewGame: (level?: DifficultyLevel) => void;
  onLevelChange: (level: DifficultyLevel) => void;
  unlockedLevels: DifficultyLevel[];
  levelUnlocked?: DifficultyLevel | null;
}

export function GameOver({ 
  gameState, 
  onNewGame, 
  onLevelChange, 
  unlockedLevels,
  levelUnlocked 
}: GameOverProps) {
  const { gameStatus, currentWord, currentLevel } = gameState;
  const isWon = gameStatus === 'won';
  const nextLevel = getNextLevel(currentLevel);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isWon ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-8 h-8 text-red-600" />
            </div>
          )}
        </div>
        <CardTitle className={`text-3xl ${isWon ? 'text-green-600' : 'text-red-600'}`}>
          {isWon ? 'Congratulations!' : 'Game Over!'}
        </CardTitle>
        <p className="text-muted-foreground mt-2">
          The word was: <span className="font-bold text-foreground">{currentWord.toUpperCase()}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {levelUnlocked && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Level Unlocked!</span>
            </div>
            <p className="text-sm text-yellow-700">
              You've unlocked <Badge className="mx-1">{DIFFICULTY_LABELS[levelUnlocked]}</Badge> level!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => onNewGame(currentLevel)} 
            className="flex-1"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          
          {nextLevel && unlockedLevels.includes(nextLevel) && (
            <Button 
              onClick={() => {
                onLevelChange(nextLevel);
                onNewGame(nextLevel);
              }}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Next Level
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['basic', 'medium', 'advance', 'pro'] as DifficultyLevel[]).map(level => (
            <Button
              key={level}
              variant={currentLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onLevelChange(level);
                onNewGame(level);
              }}
              disabled={!unlockedLevels.includes(level)}
              className="text-xs"
            >
              {DIFFICULTY_LABELS[level]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}