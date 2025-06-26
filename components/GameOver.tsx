"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, ArrowUp, Gift, Star, Zap, Target } from 'lucide-react';
import { GameState, DifficultyLevel } from '@/types/game';
import { DIFFICULTY_LABELS, getNextLevel, calculatePoints, DIFFICULTY_GRADIENTS } from '@/lib/gameLogic';

interface GameOverProps {
  gameState: GameState;
  onNewGame: (level?: DifficultyLevel) => void;
  onLevelChange: (level: DifficultyLevel) => void;
  unlockedLevels: DifficultyLevel[];
  levelUnlocked?: DifficultyLevel | null;
  pointsEarned: number;
}

export function GameOver({ 
  gameState, 
  onNewGame, 
  onLevelChange, 
  unlockedLevels,
  levelUnlocked,
  pointsEarned
}: GameOverProps) {
  const { gameStatus, currentWord, currentLevel, guessedLetters, maxWrongGuesses } = gameState;
  const [showCelebration, setShowCelebration] = useState(false);
  const isWon = gameStatus === 'won';
  const nextLevel = getNextLevel(currentLevel);

  useEffect(() => {
    if (isWon) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isWon]);

  const accuracy = guessedLetters.length > 0 
    ? Math.round((guessedLetters.filter(letter => currentWord.includes(letter)).length / guessedLetters.length) * 100)
    : 100;

  const getPerformanceMessage = () => {
    if (!isWon) return "Don't give up! Try again!";
    if (accuracy >= 90) return "Perfect performance! 🎯";
    if (accuracy >= 80) return "Excellent work! 🌟";
    if (accuracy >= 70) return "Great job! 👏";
    return "Good effort! Keep improving! 💪";
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return 'text-emerald-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      {showCelebration && isWon && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Level Unlock Notification */}
      {levelUnlocked && (
        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800">🎊 Level Unlocked!</h3>
                <p className="text-sm text-amber-700">
                  Congratulations! You've unlocked <Badge className={`bg-gradient-to-r ${DIFFICULTY_GRADIENTS[levelUnlocked]} text-white mx-1`}>
                    {DIFFICULTY_LABELS[levelUnlocked]}
                  </Badge> level!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Game Over Card */}
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        <CardHeader className={`text-center ${isWon ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-gradient-to-r from-red-50 to-rose-50'}`}>
          <div className="flex justify-center mb-4">
            {isWon ? (
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                <RotateCcw className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <CardTitle className={`text-3xl mb-2 ${isWon ? 'text-emerald-700' : 'text-red-700'}`}>
            {isWon ? '🎉 Victory!' : '💔 Game Over'}
          </CardTitle>
          <p className="text-lg text-slate-600 mb-2">
            The word was: <span className="font-bold text-slate-800 text-xl">{currentWord.toUpperCase()}</span>
          </p>
          <p className={`text-sm font-medium ${isWon ? 'text-emerald-600' : 'text-red-600'}`}>
            {getPerformanceMessage()}
          </p>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{accuracy}%</div>
              <div className="text-xs text-blue-800">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">{guessedLetters.length}</div>
              <div className="text-xs text-purple-800">Guesses</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
              <Star className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className={`text-lg font-bold ${getPointsColor(pointsEarned)}`}>
                {pointsEarned > 0 ? '+' : ''}{pointsEarned}
              </div>
              <div className="text-xs text-amber-800">Points</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="text-lg font-bold text-slate-600">{currentWord.length}</div>
              <div className="text-xs text-slate-800">Letters</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => onNewGame(currentLevel)} 
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              
              {nextLevel && unlockedLevels.includes(nextLevel) && (
                <Button 
                  onClick={() => {
                    onLevelChange(nextLevel);
                    onNewGame(nextLevel);
                  }}
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-2"
                  size="lg"
                >
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Try {DIFFICULTY_LABELS[nextLevel]}
                </Button>
              )}
            </div>
            
            {/* Level Selection */}
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
                  className="text-xs font-medium h-10"
                >
                  {DIFFICULTY_LABELS[level]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}