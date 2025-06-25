"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState } from '@/types/game';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/gameLogic';

interface GameBoardProps {
  gameState: GameState;
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { currentWord, guessedLetters, stats, currentLevel } = gameState;

  const displayWord = currentWord
    .split('')
    .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge className={`${DIFFICULTY_COLORS[currentLevel]} text-white px-4 py-2`}>
            {DIFFICULTY_LABELS[currentLevel]} Level
          </Badge>
        </div>
        <CardTitle className="text-4xl md:text-6xl font-mono tracking-wider mb-4">
          {displayWord}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.vowelCount}</div>
            <div className="text-sm text-blue-800 font-medium">Vowels</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.consonantCount}</div>
            <div className="text-sm text-green-800 font-medium">Consonants</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.repeatedLetterCount}</div>
            <div className="text-sm text-purple-800 font-medium">Repeated Letters</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}