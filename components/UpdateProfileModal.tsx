"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  X,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Upload
} from 'lucide-react';
import { User as UserType } from '@/types/game';
import { getPointsGradient } from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
}

export function UpdateProfileModal({ isOpen, onClose, user, onUpdateUser }: UpdateProfileModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    avatar: user.name.charAt(0).toUpperCase()
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  // Avatar options
  const avatarOptions = [
    '👤', '🎮', '🎯', '🏆', '⭐', '🎪', '🎨', '🎭', '🎪', '🎲',
    '🚀', '⚡', '🔥', '💎', '🌟', '🎊', '🎉', '🎈', '🎁', '🏅'
  ];

  const handleClose = () => {
    audioManager.playSound('click');
    setErrors({});
    setSuccess({});
    onClose();
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileForm.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileForm.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!user.isGuest) {
      if (!profileForm.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    setLoading(true);
    audioManager.playSound('click');

    // Simulate API call
    setTimeout(() => {
      const updatedUser: UserType = {
        ...user,
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      };

      onUpdateUser(updatedUser);
      setSuccess({ profile: true });
      setLoading(false);
      
      // Auto-close success message
      setTimeout(() => {
        setSuccess({});
      }, 3000);
    }, 1500);
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    audioManager.playSound('click');

    // Simulate API call
    setTimeout(() => {
      setSuccess({ password: true });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
      
      // Auto-close success message
      setTimeout(() => {
        setSuccess({});
      }, 3000);
    }, 1500);
  };

  const handleAvatarSelect = (avatar: string) => {
    audioManager.playSound('click', 0.3);
    setProfileForm(prev => ({ ...prev, avatar }));
  };

  const handleTabChange = (value: string) => {
    audioManager.playSound('click', 0.3);
    setActiveTab(value);
    setErrors({});
    setSuccess({});
  };

  return (
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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl">Update Profile</span>
              <div className="text-sm text-slate-400">Customize your account settings</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger 
              value="profile" 
              className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Profile Info
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              disabled={user.isGuest}
            >
              <Lock className="w-4 h-4 mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Camera className="w-5 h-5 text-purple-400" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className={`bg-gradient-to-r ${getPointsGradient(user.points)} text-white text-2xl font-bold`}>
                      {profileForm.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-white mb-2">Choose Avatar</h4>
                    <p className="text-sm text-slate-400 mb-3">Select an emoji or icon to represent you</p>
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-2">
                  {avatarOptions.map((avatar, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`aspect-square text-lg hover:scale-110 transition-transform ${
                        profileForm.avatar === avatar 
                          ? 'border-purple-500 bg-purple-500/20' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {avatar}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserIcon className="w-5 h-5 text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {success.profile && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-900/50 border border-emerald-700/50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">Profile updated successfully!</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Display Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your display name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

                {!user.isGuest && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className={`pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                )}

                {user.isGuest && (
                  <div className="p-4 bg-amber-900/50 border border-amber-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <span className="font-medium text-amber-300">Guest Account</span>
                    </div>
                    <p className="text-sm text-amber-200">
                      You're playing as a guest. Create an account to save your progress and access all features!
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-6 mt-6">
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="w-5 h-5 text-red-400" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {success.password && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-900/50 border border-emerald-700/50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">Password updated successfully!</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className={`pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                        errors.currentPassword ? 'border-red-500' : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-1 top-1 p-2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className={`pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                        errors.newPassword ? 'border-red-500' : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-1 top-1 p-2 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.newPassword}
                    </div>
                  )}
                  <div className="text-xs text-slate-400">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1 top-1 p-2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-900/50 border border-blue-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-blue-300">Security Tips</span>
                  </div>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Use a strong, unique password</li>
                    <li>• Include uppercase, lowercase, numbers, and symbols</li>
                    <li>• Don't reuse passwords from other accounts</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}