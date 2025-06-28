"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, TrendingUp, Star, Crown, UserX, Settings } from 'lucide-react';
import { User as UserType, PlayerStats } from '@/types/game';
import { getPointsGradient, getRank } from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';
import { ProfileModal } from './ProfileModal';

interface UserProfileProps {
  user: UserType;
  stats: PlayerStats;
  onSignOut: () => void;
}

export function UserProfile({ user, stats, onSignOut }: UserProfileProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const rank = getRank(stats.totalPoints);

  const handleProfileClick = () => {
    audioManager.playSound('click');
    setShowProfileModal(true);
  };

  const handleSignOut = () => {
    audioManager.playSound('click');
    onSignOut();
  };

  return (
    <>
      <Card className="w-full max-w-sm bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="p-0 h-auto hover:bg-transparent"
              >
                <Avatar className="w-12 h-12 cursor-pointer hover:scale-105 transition-transform">
                  <AvatarFallback className={`bg-gradient-to-r ${getPointsGradient(stats.totalPoints)} text-white text-lg font-bold`}>
                    {user.isGuest ? '👤' : user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  {user.name}
                  {user.isGuest && <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">Guest</Badge>}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{rank.icon}</span>
                  <span className="text-sm text-slate-400">{rank.name}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleProfileClick}
                className="text-slate-400 hover:text-white"
                title="View Profile"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="text-slate-400 hover:text-white"
                title={user.isGuest ? "End Session" : "Sign Out"}
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
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

          {/* Rank Progress */}
          {rank.nextRank && rank.pointsToNext && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Next Rank</span>
                <span className="text-sm text-slate-400">{rank.nextRank}</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (rank.pointsToNext / 1000) * 100)} 
                className="h-2"
              />
              <div className="text-xs text-slate-400 text-center">
                {rank.pointsToNext.toLocaleString()} points to {rank.nextRank}
              </div>
            </div>
          )}
          
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
              {user.isGuest ? 'Guest Session' : `Member since ${new Date(user.joinedAt).toLocaleDateString()}`}
            </Badge>
          </div>

          {user.isGuest && (
            <div className="p-3 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">Upgrade Account</span>
              </div>
              <p className="text-xs text-amber-200">
                Create an account to save your progress and earn bonus points!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        stats={stats}
        onSignOut={onSignOut}
      />
    </>
  );
}