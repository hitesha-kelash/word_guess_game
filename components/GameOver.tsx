"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, ArrowUp, Gift, Star, Zap, Target, Volume2, VolumeX } from 'lucide-react';
import { GameState, DifficultyLevel } from '@/types/game';
import { DIFFICULTY_LABELS, getNextLevel, calculatePoints, DIFFICULTY_GRADIENTS, calculateLevelUpBonus } from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';

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
  const [audioEnabled, setAudioEnabled] = useState(true);
  const isWon = gameStatus === 'won';
  const nextLevel = getNextLevel(currentLevel);

  useEffect(() => {
    // Play sound effects
    if (isWon) {
      audioManager.playSound('victory', 0.7);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    } else {
      audioManager.playSound('failure', 0.5);
    }
  }, [isWon]);

  useEffect(() => {
    // Play level up sound if level was unlocked
    if (levelUnlocked) {
      setTimeout(() => {
        audioManager.playSound('levelUp', 0.8);
      }, 1000);
    }
  }, [levelUnlocked]);

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

  const levelUpBonus = levelUnlocked ? calculateLevelUpBonus(levelUnlocked) : 0;
  const totalPointsEarned = pointsEarned + levelUpBonus;

  const handleNewGame = (level?: DifficultyLevel) => {
    audioManager.playSound('click');
    onNewGame(level);
  };

  const handleLevelChange = (level: DifficultyLevel) => {
    audioManager.playSound('click');
    onLevelChange(level);
    onNewGame(level);
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    audioManager.setEnabled(newState);
    audioManager.playSound('click');
  };

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      {showCelebration && isWon && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Audio Control */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAudio}
          className="text-slate-400 hover:text-white"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Level Unlock Notification */}
      {levelUnlocked && (
        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800">🎊 Level Unlocked!</h3>
                <p className="text-sm text-amber-700">
                  Congratulations! You've unlocked <Badge className={`bg-gradient-to-r ${DIFFICULTY_GRADIENTS[levelUnlocked]} text-white mx-1`}>
                    {DIFFICULTY_LABELS[levelUnlocked]}
                  </Badge> level!
                </p>
                {levelUpBonus > 0 && (
                  <p className="text-sm text-amber-600 font-semibold">
                    Bonus: +{levelUpBonus.toLocaleString()} points! 🎁
                  </p>
                )}
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
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
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
              <div className={`text-lg font-bold ${getPointsColor(totalPointsEarned)}`}>
                {totalPointsEarned > 0 ? '+' : ''}{totalPointsEarned.toLocaleString()}
              </div>
              <div className="text-xs text-amber-800">Total Points</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="text-lg font-bold text-slate-600">{currentWord.length}</div>
              <div className="text-xs text-slate-800">Letters</div>
            </div>
          </div>

          {/* Points Breakdown */}
          {(pointsEarned !== 0 || levelUpBonus > 0) && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border">
              <h4 className="font-semibold text-slate-700 mb-2">Points Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Game Result:</span>
                  <span className={`font-medium ${getPointsColor(pointsEarned)}`}>
                    {pointsEarned > 0 ? '+' : ''}{pointsEarned.toLocaleString()}
                  </span>
                </div>
                {levelUpBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Level Unlock Bonus:</span>
                    <span className="font-medium text-emerald-600">+{levelUpBonus.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span className="text-slate-700">Total:</span>
                  <span className={getPointsColor(totalPointsEarned)}>
                    {totalPointsEarned > 0 ? '+' : ''}{totalPointsEarned.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => handleNewGame(currentLevel)} 
                className="flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              
              {nextLevel && unlockedLevels.includes(nextLevel) && (
                <Button 
                  onClick={() => handleLevelChange(nextLevel)}
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
                  onClick={() => handleLevelChange(level)}
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