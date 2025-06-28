"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatTime, getTimerDuration } from '@/lib/gameLogic';
import { DifficultyLevel } from '@/types/game';
import { audioManager } from '@/lib/audioManager';

interface GameTimerProps {
  level: DifficultyLevel;
  gameStatus: 'playing' | 'won' | 'lost' | 'timeout';
  onTimeUp: () => void;
  timeRemaining: number;
  onTimeUpdate: (time: number) => void;
}

export function GameTimer({ level, gameStatus, onTimeUp, timeRemaining, onTimeUpdate }: GameTimerProps) {
  const [warningPlayed, setWarningPlayed] = useState(false);
  const totalTime = getTimerDuration(level);
  const progressValue = (timeRemaining / totalTime) * 100;

  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      onTimeUpdate(timeRemaining - 1);
      
      // Play warning sound at 30 seconds
      if (timeRemaining === 30 && !warningPlayed) {
        audioManager.playSound('warning', 0.6);
        setWarningPlayed(true);
      }
      
      // Play urgent warning at 10 seconds
      if (timeRemaining <= 10 && timeRemaining > 0) {
        audioManager.playSound('tick', 0.4);
      }
      
      // Time's up!
      if (timeRemaining <= 0) {
        audioManager.playSound('timeUp', 0.8);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, timeRemaining, onTimeUp, onTimeUpdate, warningPlayed]);

  // Reset warning flag when game restarts
  useEffect(() => {
    if (gameStatus === 'playing' && timeRemaining === totalTime) {
      setWarningPlayed(false);
    }
  }, [gameStatus, timeRemaining, totalTime]);

  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'text-red-600';
    if (timeRemaining <= 30) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getProgressColor = () => {
    if (timeRemaining <= 10) return 'bg-red-500';
    if (timeRemaining <= 30) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getBorderColor = () => {
    if (timeRemaining <= 10) return 'border-red-300';
    if (timeRemaining <= 30) return 'border-amber-300';
    return 'border-emerald-300';
  };

  return (
    <Card className={`w-full max-w-md mx-auto mb-6 border-2 ${getBorderColor()} ${timeRemaining <= 10 ? 'animate-pulse' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${timeRemaining <= 30 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            {timeRemaining <= 30 ? (
              <AlertTriangle className={`w-5 h-5 ${getTimerColor()}`} />
            ) : (
              <Clock className={`w-5 h-5 ${getTimerColor()}`} />
            )}
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold font-mono ${getTimerColor()}`}>
              {formatTime(Math.max(0, timeRemaining))}
            </div>
            <div className="text-sm text-slate-600">Time Remaining</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={Math.max(0, progressValue)} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0:00</span>
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>
        
        {timeRemaining <= 30 && timeRemaining > 0 && (
          <div className="mt-3 text-center">
            <div className={`text-sm font-medium ${getTimerColor()}`}>
              {timeRemaining <= 10 ? '⚠️ Hurry up!' : '⏰ Time running out!'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}