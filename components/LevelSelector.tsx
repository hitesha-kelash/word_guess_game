"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Star, Trophy, Target } from 'lucide-react';
import { PlayerStats, DifficultyLevel } from '@/types/game';
import { DIFFICULTY_LABELS, DIFFICULTY_GRADIENTS, getLevelProgress, UNLOCK_REQUIREMENTS } from '@/lib/gameLogic';

interface LevelSelectorProps {
  playerStats: PlayerStats;
  onLevelSelect: (level: DifficultyLevel) => void;
}

export function LevelSelector({ playerStats, onLevelSelect }: LevelSelectorProps) {
  return (
    <Card className="max-w-4xl mx-auto bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white mb-2">Choose Your Challenge</CardTitle>
        <p className="text-slate-400">Select a difficulty level to begin your word-guessing adventure</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['basic', 'medium', 'advance', 'pro'] as DifficultyLevel[]).map(level => {
            const levelStats = playerStats.levelStats[level];
            const isUnlocked = playerStats.unlockedLevels.includes(level);
            const winRate = levelStats.played > 0 ? Math.round((levelStats.won / levelStats.played) * 100) : 0;
            const progress = getLevelProgress(level, levelStats.won);
            const isMaxLevel = level === 'pro';

            return (
              <Card 
                key={level} 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:shadow-lg cursor-pointer' 
                    : 'bg-slate-800/30 border-slate-700 opacity-60'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`bg-gradient-to-r ${DIFFICULTY_GRADIENTS[level]} text-white px-4 py-2 font-semibold`}>
                      {DIFFICULTY_LABELS[level]}
                    </Badge>
                    {isUnlocked ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {isUnlocked ? (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-slate-600/50 rounded-lg">
                          <div className="text-lg font-bold text-white">{levelStats.played}</div>
                          <div className="text-xs text-slate-400">Played</div>
                        </div>
                        <div className="text-center p-2 bg-slate-600/50 rounded-lg">
                          <div className="text-lg font-bold text-emerald-400">{levelStats.won}</div>
                          <div className="text-xs text-slate-400">Won</div>
                        </div>
                        <div className="text-center p-2 bg-slate-600/50 rounded-lg">
                          <div className="text-lg font-bold text-blue-400">{winRate}%</div>
                          <div className="text-xs text-slate-400">Win Rate</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Points Earned</span>
                        <span className="text-amber-400 font-semibold">{levelStats.pointsEarned}</span>
                      </div>
                      
                      {!isMaxLevel && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400">Next Level Progress</span>
                            <span className="text-xs text-slate-400">{progress.current}/{progress.required}</span>
                          </div>
                          <Progress value={progress.percentage} className="h-2" />
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => onLevelSelect(level)}
                        className={`w-full bg-gradient-to-r ${DIFFICULTY_GRADIENTS[level]} hover:opacity-90 text-white font-semibold`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play {DIFFICULTY_LABELS[level]}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <Lock className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm mb-2">
                        Requires {UNLOCK_REQUIREMENTS[level]} wins
                      </p>
                      <p className="text-slate-500 text-xs">
                        Complete previous level to unlock
                      </p>
                    </div>
                  )}
                </CardContent>
                
                {/* Difficulty indicators */}
                <div className="absolute top-2 right-2">
                  <div className="flex gap-1">
                    {Array.from({ length: ['basic', 'medium', 'advance', 'pro'].indexOf(level) + 1 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}