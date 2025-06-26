"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Star, Lock, CheckCircle } from 'lucide-react';
import { PlayerStats as PlayerStatsType, DifficultyLevel } from '@/types/game';
import { DIFFICULTY_LABELS, DIFFICULTY_GRADIENTS, getLevelProgress, UNLOCK_REQUIREMENTS } from '@/lib/gameLogic';

interface PlayerStatsProps {
  stats: PlayerStatsType;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{stats.gamesPlayed}</div>
                <div className="text-xs text-emerald-800 font-medium">Games Played</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.gamesWon}</div>
                <div className="text-xs text-blue-800 font-medium">Games Won</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Win Rate</span>
                <span className="text-lg font-bold text-purple-600">{stats.winRate}%</span>
              </div>
              <Progress value={stats.winRate} className="h-3" />
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Current Streak</span>
              </div>
              <span className="text-xl font-bold text-amber-600">{stats.currentStreak}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              Achievement Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg border border-indigo-200">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-sm text-indigo-800 font-medium">Total Points</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Best Streak</span>
                <span className="text-lg font-bold text-emerald-600">{stats.bestStreak}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Levels Unlocked</span>
                <span className="text-lg font-bold text-blue-600">{stats.unlockedLevels.length}/4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600" />
            Level Progress & Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['basic', 'medium', 'advance', 'pro'] as DifficultyLevel[]).map(level => {
              const levelStats = stats.levelStats[level];
              const isUnlocked = stats.unlockedLevels.includes(level);
              const winRate = levelStats.played > 0 ? Math.round((levelStats.won / levelStats.played) * 100) : 0;
              const progress = getLevelProgress(level, levelStats.won);
              const isMaxLevel = level === 'pro';

              return (
                <div key={level} className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-slate-300' 
                    : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`bg-gradient-to-r ${DIFFICULTY_GRADIENTS[level]} text-white text-xs font-semibold px-3 py-1`}>
                        {DIFFICULTY_LABELS[level]}
                      </Badge>
                      {isUnlocked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700">{levelStats.won}/{levelStats.played}</div>
                      <div className="text-xs text-slate-500">wins</div>
                    </div>
                  </div>
                  
                  {isUnlocked ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">{winRate}%</div>
                          <div className="text-blue-800">Win Rate</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded">
                          <div className="font-bold text-amber-600">{levelStats.pointsEarned}</div>
                          <div className="text-amber-800">Points</div>
                        </div>
                      </div>
                      
                      {!isMaxLevel && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-slate-600">Next Level Progress</span>
                            <span className="text-xs text-slate-500">{progress.current}/{progress.required}</span>
                          </div>
                          <Progress value={progress.percentage} className="h-2" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <div className="text-xs text-slate-500 mb-1">
                        Requires {UNLOCK_REQUIREMENTS[level]} wins in previous level
                      </div>
                      <div className="text-xs font-medium text-slate-600">🔒 Locked</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}