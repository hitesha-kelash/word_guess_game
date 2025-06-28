"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User as UserIcon, 
  Trophy, 
  TrendingUp, 
  Star, 
  Crown, 
  Calendar,
  Target,
  Zap,
  Award,
  BarChart3,
  Coins,
  Lock,
  CheckCircle,
  Volume2,
  VolumeX,
  X,
  Settings
} from 'lucide-react';
import { User as UserType, PlayerStats, DifficultyLevel } from '@/types/game';
import { 
  getPointsGradient, 
  getRank, 
  DIFFICULTY_LABELS, 
  DIFFICULTY_GRADIENTS,
  getLevelProgress,
  UNLOCK_REQUIREMENTS
} from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';
import { UpdateProfileModal } from './UpdateProfileModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  stats: PlayerStats;
  onSignOut: () => void;
}

export function ProfileModal({ isOpen, onClose, user, stats, onSignOut }: ProfileModalProps) {
  const [audioEnabled, setAudioEnabled] = useState(audioManager.isEnabled());
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const rank = getRank(stats.totalPoints);

  const handleClose = () => {
    audioManager.playSound('click');
    onClose();
  };

  const handleSignOut = () => {
    audioManager.playSound('click');
    onSignOut();
    onClose();
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    audioManager.setEnabled(newState);
    audioManager.playSound('click');
  };

  const handleUpdateProfile = () => {
    audioManager.playSound('click');
    setShowUpdateProfile(true);
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    // Close the update profile modal automatically
    setShowUpdateProfile(false);
    // In a real app, you'd also update the parent component's user state
    // For now, we'll just update the local state to reflect changes immediately
  };

  const handleCloseUpdateProfile = () => {
    setShowUpdateProfile(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute right-0 top-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <DialogTitle className="flex items-center gap-3 text-white pr-10">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`bg-gradient-to-r ${getPointsGradient(stats.totalPoints)} text-white text-lg font-bold`}>
                  {currentUser.isGuest ? '👤' : currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentUser.name}</span>
                  {currentUser.isGuest && <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">Guest</Badge>}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <span>{rank.icon}</span>
                  <span>{rank.name}</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger 
                value="overview" 
                className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                onClick={() => audioManager.playSound('click', 0.3)}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="levels" 
                className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                onClick={() => audioManager.playSound('click', 0.3)}
              >
                Levels
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                onClick={() => audioManager.playSound('click', 0.3)}
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Points and Rank */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Coins className="w-5 h-5 text-amber-400" />
                    Points & Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${getPointsGradient(stats.totalPoints)} rounded-lg`}>
                    <div className="flex items-center gap-2">
                      <Crown className="w-6 h-6 text-white" />
                      <span className="font-medium text-white text-lg">Total Points</span>
                    </div>
                    <span className="text-3xl font-bold text-white">
                      {stats.totalPoints.toLocaleString()}
                    </span>
                  </div>

                  {/* Rank Progress */}
                  {rank.nextRank && rank.pointsToNext && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-300">Progress to {rank.nextRank}</span>
                        <span className="text-sm text-slate-400">{rank.pointsToNext.toLocaleString()} points needed</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (rank.pointsToNext / 1000) * 100)} 
                        className="h-3"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game Statistics */}
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Game Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                      <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-emerald-600">{stats.gamesWon}</div>
                      <div className="text-xs text-emerald-800 font-medium">Games Won</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</div>
                      <div className="text-xs text-blue-800 font-medium">Total Played</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
                      <div className="text-xs text-purple-800 font-medium">Current Streak</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                      <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-amber-600">{stats.winRate}%</div>
                      <div className="text-xs text-amber-800 font-medium">Win Rate</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-slate-600/50 to-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium text-slate-200">Best Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">{stats.bestStreak}</div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-slate-600/50 to-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium text-slate-200">Member Since</span>
                      </div>
                      <div className="text-sm text-cyan-400">
                        {currentUser.isGuest ? 'Guest Session' : new Date(currentUser.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {currentUser.isGuest && (
                <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-2 border-amber-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="w-8 h-8 text-amber-400" />
                      <div>
                        <h3 className="text-lg font-bold text-amber-300">Upgrade Your Account</h3>
                        <p className="text-sm text-amber-200">
                          Create an account to save your progress permanently and earn bonus points!
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-amber-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Permanent progress saving</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>1000 bonus points on signup</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Leaderboard participation</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Achievement tracking</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="levels" className="space-y-6 mt-6">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                            ? 'bg-gradient-to-br from-slate-600/50 to-slate-700/50 border-slate-500' 
                            : 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-slate-600'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge className={`bg-gradient-to-r ${DIFFICULTY_GRADIENTS[level]} text-white text-xs font-semibold px-3 py-1`}>
                                {DIFFICULTY_LABELS[level]}
                              </Badge>
                              {isUnlocked ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white">{levelStats.won}/{levelStats.played}</div>
                              <div className="text-xs text-slate-400">wins</div>
                            </div>
                          </div>
                          
                          {isUnlocked ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center p-2 bg-blue-500/20 rounded border border-blue-500/30">
                                  <div className="font-bold text-blue-300">{winRate}%</div>
                                  <div className="text-blue-400">Win Rate</div>
                                </div>
                                <div className="text-center p-2 bg-amber-500/20 rounded border border-amber-500/30">
                                  <div className="font-bold text-amber-300">{levelStats.pointsEarned.toLocaleString()}</div>
                                  <div className="text-amber-400">Points</div>
                                </div>
                                <div className="text-center p-2 bg-purple-500/20 rounded border border-purple-500/30">
                                  <div className="font-bold text-purple-300">{levelStats.bestStreak}</div>
                                  <div className="text-purple-400">Best Streak</div>
                                </div>
                              </div>
                              
                              {!isMaxLevel && (
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-slate-300">Next Level Progress</span>
                                    <span className="text-xs text-slate-400">{progress.current}/{progress.required}</span>
                                  </div>
                                  <Progress value={progress.percentage} className="h-2" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <div className="text-xs text-slate-400 mb-1">
                                Requires {UNLOCK_REQUIREMENTS[level]} wins in previous level
                              </div>
                              <div className="text-xs font-medium text-slate-500">🔒 Locked</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      {audioEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
                      <div>
                        <span className="font-medium text-white">Sound Effects</span>
                        <p className="text-sm text-slate-400">Enable audio feedback for game events</p>
                      </div>
                    </div>
                    <Button
                      variant={audioEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleAudio}
                      className={audioEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-500 text-slate-300"}
                    >
                      {audioEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {/* Only show Update Profile for registered users */}
                  {!currentUser.isGuest && (
                    <div className="flex items-center justify-between p-4 bg-slate-600/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-purple-400" />
                        <div>
                          <span className="font-medium text-white">Update Profile</span>
                          <p className="text-sm text-slate-400">Change your avatar, name, and password</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUpdateProfile}
                        className="border-slate-500 text-slate-300 hover:bg-slate-700"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}

                  <div className="p-4 bg-slate-600/50 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3 mb-3">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-white">Account Information</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="text-white">{currentUser.name}</span>
                      </div>
                      {!currentUser.isGuest && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Email:</span>
                          <span className="text-white">{currentUser.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Type:</span>
                        <span className="text-white">{currentUser.isGuest ? 'Guest' : 'Registered'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Joined:</span>
                        <span className="text-white">
                          {currentUser.isGuest ? 'Current Session' : new Date(currentUser.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full"
                  >
                    {currentUser.isGuest ? 'End Session' : 'Sign Out'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Update Profile Modal - Only for registered users */}
      {!currentUser.isGuest && (
        <UpdateProfileModal
          isOpen={showUpdateProfile}
          onClose={handleCloseUpdateProfile}
          user={currentUser}
          onUpdateUser={handleUserUpdate}
        />
      )}
    </>
  );
}