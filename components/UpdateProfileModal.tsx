"use client";

import { useState, useRef } from 'react';
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
  Upload,
  Image as ImageIcon
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    avatar: user.name.charAt(0).toUpperCase(),
    profileImage: null as string | null
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ profileImage: 'Please select a valid image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ profileImage: 'Image size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileForm(prev => ({ 
          ...prev, 
          profileImage: result,
          avatar: '' // Clear emoji avatar when image is uploaded
        }));
        setErrors(prev => ({ ...prev, profileImage: '' }));
        audioManager.playSound('click', 0.3);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileForm(prev => ({ 
      ...prev, 
      profileImage: null,
      avatar: user.name.charAt(0).toUpperCase() // Reset to initial
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    audioManager.playSound('click', 0.3);
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileForm.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileForm.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      
      // Show success message briefly, then close modal
      setTimeout(() => {
        setSuccess({});
        handleClose(); // Close the modal after successful update
      }, 1500);
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
      
      // Show success message briefly, then close modal
      setTimeout(() => {
        setSuccess({});
        handleClose(); // Close the modal after successful password update
      }, 1500);
    }, 1500);
  };

  const handleAvatarSelect = (avatar: string) => {
    audioManager.playSound('click', 0.3);
    setProfileForm(prev => ({ 
      ...prev, 
      avatar,
      profileImage: null // Clear uploaded image when emoji is selected
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className={`bg-gradient-to-r ${getPointsGradient(user.points)} text-white text-2xl font-bold`}>
                        {profileForm.profileImage ? (
                          <img 
                            src={profileForm.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          profileForm.avatar
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {profileForm.profileImage && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-2">Profile Picture</h4>
                    <p className="text-sm text-slate-400 mb-3">Upload a custom image or choose an emoji avatar</p>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      
                      {profileForm.profileImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {errors.profileImage && (
                      <div className="flex items-center gap-1 text-red-400 text-sm mt-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.profileImage}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 mt-2">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </div>
                  </div>
                </div>

                {!profileForm.profileImage && (
                  <>
                    <div className="border-t border-slate-600 pt-4">
                      <h4 className="font-medium text-white mb-3">Or choose an emoji avatar</h4>
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
                    </div>
                  </>
                )}
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
                    <span className="text-emerald-300 font-medium">Profile updated successfully! Closing...</span>
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
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

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
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

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
                    <span className="text-emerald-300 font-medium">Password updated successfully! Closing...</span>
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
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-1 top-1 p-2 text-slate-400 hover:text-white"
                      disabled={loading}
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
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-1 top-1 p-2 text-slate-400 hover:text-white"
                      disabled={loading}
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
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1 top-1 p-2 text-slate-400 hover:text-white"
                      disabled={loading}
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