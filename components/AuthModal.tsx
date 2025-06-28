"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Mail, Lock, UserPlus, LogIn, Sparkles, UserCheck } from 'lucide-react';
import { User as UserType } from '@/types/game';
import { NEW_ACCOUNT_BONUS } from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: UserType) => void;
  onGuestPlay: () => void;
}

export function AuthModal({ isOpen, onClose, onAuth, onGuestPlay }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      const user: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        points: isSignUp ? NEW_ACCOUNT_BONUS : 1000,
        joinedAt: new Date().toISOString(),
        isGuest: false
      };
      
      audioManager.playSound('click');
      onAuth(user);
      setLoading(false);
    }, 1500);
  };

  const handleGuestPlay = () => {
    const guestUser: UserType = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      name: 'Guest Player',
      email: '',
      points: 500, // Guests start with fewer points
      joinedAt: new Date().toISOString(),
      isGuest: true
    };
    
    audioManager.playSound('click');
    onGuestPlay();
    onAuth(guestUser);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {isSignUp ? 'Join WordMaster' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Guest Play Option */}
          <div className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-slate-300" />
              <span className="font-semibold text-slate-200">Quick Start</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Jump right into the game without creating an account. Your progress won't be saved.
            </p>
            <Button 
              onClick={handleGuestPlay}
              variant="outline"
              className="w-full border-slate-500 text-slate-300 hover:bg-slate-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Play as Guest
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-400">Or create account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Please wait...
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-slate-400 hover:text-white"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
            
            {isSignUp && (
              <div className="p-4 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Welcome Bonus!</span>
                </div>
                <p className="text-sm text-emerald-200">
                  🎉 Get {NEW_ACCOUNT_BONUS.toLocaleString()} points when you create your account and start your word mastery journey!
                </p>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}