"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameState } from '@/types/game';
import { DIFFICULTY_LABELS, DIFFICULTY_GRADIENTS, isWordComplete } from '@/lib/gameLogic';
import { Eye, Hash, Repeat, Target } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { currentWord, guessedLetters, stats, currentLevel } = gameState;

  const displayWord = currentWord
    .split('')
    .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');

  const progress = (currentWord.split('').filter(letter => 
    guessedLetters.includes(letter)
  ).length / currentWord.length) * 100;

  const isComplete = isWordComplete(currentWord, guessedLetters);

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6 overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge className={`bg-gradient-to-r ${DIFFICULTY_GRADIENTS[currentLevel]} text-white px-6 py-2 text-sm font-semibold shadow-lg`}>
            {DIFFICULTY_LABELS[currentLevel]} Level
          </Badge>
        </div>
        
        <div className="space-y-4">
          <CardTitle className="text-4xl md:text-6xl font-mono tracking-[0.3em] mb-4 text-slate-800 select-none">
            {displayWord}
          </CardTitle>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Word Progress</span>
              <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-slate-200"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-800">Vowels</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.vowelCount}</div>
          </div>
          
          <div className="group p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-emerald-800">Consonants</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.consonantCount}</div>
          </div>
          
          <div className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Repeat className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-purple-800">Repeated</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.repeatedLetterCount}</div>
          </div>
          
          <div className="group p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-amber-800">Length</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{currentWord.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}