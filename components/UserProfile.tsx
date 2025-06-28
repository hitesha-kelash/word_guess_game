"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, UserX } from 'lucide-react';
import { User as UserType, PlayerStats } from '@/types/game';
import { getPointsGradient } from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';
import { ProfileModal } from './ProfileModal';

interface UserProfileProps {
  user: UserType;
  stats: PlayerStats;
  onSignOut: () => void;
  onUserUpdate: (updatedUser: UserType) => void;
}

export function UserProfile({ user, stats, onSignOut, onUserUpdate }: UserProfileProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleProfileClick = () => {
    audioManager.playSound('click');
    setShowProfileModal(true);
  };

  const handleSignOut = () => {
    audioManager.playSound('click');
    onSignOut();
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    onUserUpdate(updatedUser);
    setShowProfileModal(false);
  };

  return (
    <>
      {/* Compact Profile Button */}
      <div className="flex items-center gap-2">
        {/* Profile Avatar Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleProfileClick}
          className="p-2 hover:bg-slate-700/50 rounded-full transition-all duration-200 hover:scale-105"
          title="View Profile"
        >
          <Avatar className="w-10 h-10 cursor-pointer">
            <AvatarFallback className={`bg-gradient-to-r ${getPointsGradient(stats.totalPoints)} text-white text-sm font-bold`}>
              {user.isGuest ? '👤' : user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>

        {/* Quick Info */}
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{user.name}</span>
            {user.isGuest && <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">Guest</Badge>}
          </div>
          <div className="text-xs text-slate-400">
            {stats.totalPoints.toLocaleString()} points
          </div>
        </div>

        {/* Settings Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleProfileClick}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
          title="Profile Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Sign Out Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut} 
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-full"
          title={user.isGuest ? "End Session" : "Sign Out"}
        >
          <UserX className="w-4 h-4" />
        </Button>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={handleCloseModal}
        user={user}
        stats={stats}
        onSignOut={onSignOut}
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
}