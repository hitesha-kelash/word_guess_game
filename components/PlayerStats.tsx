"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';
import { PlayerStats as PlayerStatsType, DifficultyLevel } from '@/types/game';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/gameLogic';

interface PlayerStatsProps {
  stats: PlayerStatsType;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Overall Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Games Played</span>
            <span className="text-lg font-bold">{stats.gamesPlayed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Games Won</span>
            <span className="text-lg font-bold text-green-600">{stats.gamesWon}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Win Rate</span>
              <span className="text-lg font-bold">{stats.winRate}%</span>
            </div>
            <Progress value={stats.winRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['basic', 'medium', 'advance', 'pro'] as DifficultyLevel[]).map(level => {
            const levelStats = stats.levelStats[level];
            const isUnlocked = stats.unlockedLevels.includes(level);
            const winRate = levelStats.played > 0 ? Math.round((levelStats.won / levelStats.played) * 100) : 0;

            return (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${isUnlocked ? DIFFICULTY_COLORS[level] : 'bg-gray-400'} text-white text-xs`}
                  >
                    {DIFFICULTY_LABELS[level]}
                  </Badge>
                  {!isUnlocked && <span className="text-xs text-muted-foreground">Locked</span>}
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{levelStats.won}/{levelStats.played}</div>
                  <div className="text-muted-foreground">{winRate}% win</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}