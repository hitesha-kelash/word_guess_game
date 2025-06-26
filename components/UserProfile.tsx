"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Coins, Trophy, LogOut, TrendingUp, Star } from 'lucide-react';
import { User as UserType, PlayerStats } from '@/types/game';
import { getPointsColor, getPointsGradient } from '@/lib/gameLogic';

interface UserProfileProps {
  user: UserType;
  stats: PlayerStats;
  onSignOut: () => void;
}

export function UserProfile({ user, stats, onSignOut }: UserProfileProps) {
  const getRank = (points: number) => {
    if (points >= 10000) return { name: 'Grandmaster', icon: '👑' };
    if (points >= 5000) return { name: 'Master', icon: '🏆' };
    if (points >= 3000) return { name: 'Expert', icon: '⭐' };
    if (points >= 1500) return { name: 'Advanced', icon: '🎯' };
    if (points >= 500) return { name: 'Intermediate', icon: '📚' };
    return { name: 'Beginner', icon: '🌱' };
  };

  const rank = getRank(stats.totalPoints);

  return (
    <Card className="w-full max-w-sm bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className={`bg-gradient-to-r ${getPointsGradient(stats.totalPoints)} text-white text-lg font-bold`}>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{user.name}</h3>
              <div className="flex items-center gap-1">
                <span className="text-sm">{rank.icon}</span>
                <span className="text-sm text-slate-400">{rank.name}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onSignOut} className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${getPointsGradient(stats.totalPoints)} rounded-lg`}>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-white" />
            <span className="font-medium text-white">Points</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {stats.totalPoints.toLocaleString()}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{stats.gamesWon}</div>
            <div className="text-xs text-slate-400">Wins</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{stats.currentStreak}</div>
            <div className="text-xs text-slate-400">Streak</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <Star className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{stats.winRate}%</div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
        </div>
        
        <div className="text-center">
          <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
            Member since {new Date(user.joinedAt).toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}