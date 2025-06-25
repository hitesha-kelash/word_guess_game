"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Coins, Trophy, LogOut, TrendingUp } from 'lucide-react';
import { User as UserType, PlayerStats } from '@/types/game';

interface UserProfileProps {
  user: UserType;
  stats: PlayerStats;
  onSignOut: () => void;
}

export function UserProfile({ user, stats, onSignOut }: UserProfileProps) {
  const getPointsColor = (points: number) => {
    if (points >= 2000) return 'text-green-600';
    if (points >= 1000) return 'text-blue-600';
    if (points >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Points</span>
          </div>
          <span className={`text-xl font-bold ${getPointsColor(stats.totalPoints)}`}>
            {stats.totalPoints.toLocaleString()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <Trophy className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{stats.gamesWon}</div>
            <div className="text-xs text-blue-800">Wins</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">{stats.currentStreak}</div>
            <div className="text-xs text-green-800">Streak</div>
          </div>
        </div>
        
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            Member since {new Date(user.joinedAt).toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}