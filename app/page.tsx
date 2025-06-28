"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameBoard } from '@/components/GameBoard';
import { GuessInput } from '@/components/GuessInput';
import { GameStats } from '@/components/GameStats';
import { GameOver } from '@/components/GameOver';
import { PlayerStats } from '@/components/PlayerStats';
import { AuthModal } from '@/components/AuthModal';
import { UserProfile } from '@/components/UserProfile';
import { RealTimeStats } from '@/components/RealTimeStats';
import { LevelSelector } from '@/components/LevelSelector';
import { GameTimer } from '@/components/GameTimer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GameState, PlayerStats as PlayerStatsType, DifficultyLevel, User, GameSession } from '@/types/game';
import { 
  getRandomWord, 
  calculateWordStats, 
  isWordComplete, 
  shouldUnlockNextLevel,
  getNextLevel,
  calculatePoints,
  STARTING_POINTS,
  calculateLevelUpBonus,
  getRank,
  getTimerDuration
} from '@/lib/gameLogic';
import { audioManager } from '@/lib/audioManager';
import { Gamepad2, BarChart3, Play, Code2, Heart, User as UserIcon, Home as HomeIcon, Trophy, Star } from 'lucide-react';

const initialPlayerStats: PlayerStatsType = {
  gamesPlayed: 0,
  gamesWon: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalPoints: STARTING_POINTS,
  levelStats: {
    basic: { played: 0, won: 0, bestStreak: 0, pointsEarned: 0 },
    medium: { played: 0, won: 0, bestStreak: 0, pointsEarned: 0 },
    advance: { played: 0, won: 0, bestStreak: 0, pointsEarned: 0 },
    pro: { played: 0, won: 0, bestStreak: 0, pointsEarned: 0 }
  },
  unlockedLevels: ['basic']
};

export default function Home() {
  const [user, setUser] = useLocalStorage<User | null>('wordGameUser', null);
  const [playerStats, setPlayerStats] = useLocalStorage<PlayerStatsType>('wordGameStats', initialPlayerStats);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelUnlocked, setLevelUnlocked] = useState<DifficultyLevel | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [gameProcessed, setGameProcessed] = useState(false);
  const [previousRank, setPreviousRank] = useState<string | null>(null);

  const createInitialGameState = useCallback((level: DifficultyLevel = 'basic'): GameState => {
    const word = getRandomWord(level);
    const timerDuration = getTimerDuration(level);
    return {
      currentWord: word,
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongGuesses: 10,
      gameStatus: 'playing',
      currentLevel: level,
      stats: calculateWordStats(word),
      timeRemaining: timerDuration,
      gameStartTime: Date.now()
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState('basic'));

  const handleGuess = useCallback((letter: string) => {
    if (gameState.gameStatus !== 'playing' || gameState.guessedLetters.includes(letter)) {
      return;
    }

    audioManager.playSound('click', 0.3);

    setGameState(prev => {
      const newGuessedLetters = [...prev.guessedLetters, letter];
      const isCorrect = prev.currentWord.includes(letter);
      const newWrongGuesses = isCorrect ? prev.wrongGuesses : prev.wrongGuesses + 1;
      
      let newStatus: 'playing' | 'won' | 'lost' | 'timeout' = 'playing';
      if (isWordComplete(prev.currentWord, newGuessedLetters)) {
        newStatus = 'won';
      } else if (newWrongGuesses >= prev.maxWrongGuesses) {
        newStatus = 'lost';
      }

      return {
        ...prev,
        guessedLetters: newGuessedLetters,
        wrongGuesses: newWrongGuesses,
        gameStatus: newStatus
      };
    });
  }, [gameState.gameStatus, gameState.guessedLetters]);

  const handleTimeUp = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'timeout'
    }));
  }, []);

  const handleTimeUpdate = useCallback((newTime: number) => {
    setGameState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, newTime)
    }));
  }, []);

  // Process game end only once
  useEffect(() => {
    if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost' || gameState.gameStatus === 'timeout') && !gameProcessed) {
      setGameProcessed(true);
      
      const isWon = gameState.gameStatus === 'won';
      const completedInTime = gameState.gameStatus !== 'timeout';
      const points = calculatePoints(
        gameState.currentLevel, 
        isWon, 
        gameState.guessedLetters.length, 
        gameState.maxWrongGuesses,
        completedInTime
      );
      
      // Store previous rank for comparison
      const currentRank = getRank(playerStats.totalPoints);
      setPreviousRank(currentRank.name);
      
      setPlayerStats(prev => {
        const newStats = { ...prev };
        newStats.gamesPlayed += 1;
        
        if (isWon) {
          newStats.gamesWon += 1;
          newStats.currentStreak += 1;
          if (newStats.currentStreak > newStats.bestStreak) {
            newStats.bestStreak = newStats.currentStreak;
          }
        } else {
          newStats.currentStreak = 0;
        }
        
        newStats.winRate = Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100);
        newStats.totalPoints = Math.max(0, newStats.totalPoints + points);

        // Update level-specific stats
        const levelStat = newStats.levelStats[gameState.currentLevel];
        levelStat.played += 1;
        levelStat.pointsEarned += points;
        if (isWon) {
          levelStat.won += 1;
          
          // Update level streak
          if (newStats.currentStreak > levelStat.bestStreak) {
            levelStat.bestStreak = newStats.currentStreak;
          }
        }

        // Check for level unlock
        const nextLevel = getNextLevel(gameState.currentLevel);
        if (nextLevel && !newStats.unlockedLevels.includes(nextLevel)) {
          if (shouldUnlockNextLevel(gameState.currentLevel, levelStat.won)) {
            newStats.unlockedLevels.push(nextLevel);
            setLevelUnlocked(nextLevel);
            
            // Add level unlock bonus
            const levelUpBonus = calculateLevelUpBonus(nextLevel);
            newStats.totalPoints += levelUpBonus;
            levelStat.pointsEarned += levelUpBonus;
          }
        }

        return newStats;
      });

      // Update session
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          endTime: Date.now(),
          pointsEarned: points,
          won: isWon,
          word: gameState.currentWord,
          guessCount: gameState.guessedLetters.length,
          completedInTime
        } : null);
      }
    }
  }, [gameState.gameStatus, gameState.currentLevel, gameState.guessedLetters.length, gameState.maxWrongGuesses, gameState.currentWord, gameProcessed, setPlayerStats, currentSession, playerStats.totalPoints]);

  const handleNewGame = useCallback((level?: DifficultyLevel) => {
    const newLevel = level || gameState.currentLevel;
    setGameState(createInitialGameState(newLevel));
    setLevelUnlocked(null);
    setGameProcessed(false);
    
    // Create new session
    setCurrentSession({
      startTime: Date.now(),
      pointsEarned: 0,
      level: newLevel,
      won: false,
      word: '',
      guessCount: 0,
      completedInTime: true
    });
  }, [gameState.currentLevel, createInitialGameState]);

  const handleLevelChange = useCallback((level: DifficultyLevel) => {
    if (playerStats.unlockedLevels.includes(level)) {
      setGameState(createInitialGameState(level));
      setLevelUnlocked(null);
      setGameProcessed(false);
      
      // Create new session
      setCurrentSession({
        startTime: Date.now(),
        pointsEarned: 0,
        level: level,
        won: false,
        word: '',
        guessCount: 0,
        completedInTime: true
      });
    }
  }, [playerStats.unlockedLevels, createInitialGameState]);

  const handleAuth = (newUser: User) => {
    setUser(newUser);
    setShowAuth(false);
    
    // If it's a new account (not guest), reset stats with bonus points
    if (!newUser.isGuest && newUser.points === 1000) {
      setPlayerStats({
        ...initialPlayerStats,
        totalPoints: newUser.points
      });
    }
  };

  const handleGuestPlay = () => {
    // Reset stats for guest with reduced starting points
    setPlayerStats({
      ...initialPlayerStats,
      totalPoints: 500
    });
  };

  const handleSignOut = () => {
    setUser(null);
    setGameStarted(false);
    setShowStats(false);
    setGameState(createInitialGameState('basic'));
    setCurrentSession(null);
    setGameProcessed(false);
    setPlayerStats(initialPlayerStats);
  };

  // Handle user profile updates
  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, [setUser]);

  const wrongLetters = gameState.guessedLetters.filter(letter => 
    !gameState.currentWord.includes(letter)
  );

  // Calculate current points for display
  const currentPoints = gameState.gameStatus === 'playing' && currentSession
    ? calculatePoints(gameState.currentLevel, true, gameState.guessedLetters.length, gameState.maxWrongGuesses, true)
    : currentSession?.pointsEarned || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-16">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
              WordMaster
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Challenge your vocabulary across four difficulty levels. Earn points, unlock achievements, and compete with friends in this modern word-guessing experience.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Progressive Difficulty</h3>
                  <p className="text-slate-400 text-sm">Four challenging levels from Basic to Professional</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
                  <p className="text-slate-400 text-sm">Track your performance with detailed statistics</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Points & Rewards</h3>
                  <p className="text-slate-400 text-sm">Earn points and unlock new difficulty levels</p>
                </CardContent>
              </Card>
            </div>

            {/* Developer Credits */}
            <div className="mb-12">
              <Card className="max-w-lg mx-auto bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Code2 className="w-6 h-6 text-purple-400" />
                    <span className="text-xl font-semibold text-purple-200">Crafted with</span>
                    <Heart className="w-6 h-6 text-red-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-300 mb-3">Developed by</p>
                    <div className="flex justify-center gap-4">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 text-base font-semibold">
                        Hitesha
                      </Badge>
                      <span className="text-purple-400 font-bold text-2xl">&</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 text-base font-semibold">
                        Parshad
                      </Badge>
                    </div>
                    <p className="text-sm text-purple-400 mt-4 italic">
                      Building exceptional gaming experiences
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg" 
              onClick={() => setShowAuth(true)}
              className="px-12 py-6 text-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl"
            >
              <UserIcon className="w-6 h-6 mr-3" />
              Start Your Journey
            </Button>
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          onAuth={handleAuth}
          onGuestPlay={handleGuestPlay}
        />
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Gamepad2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                WordMaster
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Ready to challenge your vocabulary? Choose your difficulty and start earning points!
              </p>
            </div>
            
            <UserProfile user={user} stats={playerStats} onSignOut={handleSignOut} onUserUpdate={handleUserUpdate} />
          </div>

          {/* Developer Credits - Compact */}
          <div className="mb-8">
            <Card className="max-w-md mx-auto bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-semibold text-purple-200">Crafted by</span>
                  <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="flex justify-center gap-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-medium">
                      Hitesha
                    </Badge>
                    <span className="text-purple-400 font-bold text-lg">&</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-medium">
                      Parshad
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={() => {
                audioManager.playSound('click');
                setGameStarted(true);
                handleNewGame();
              }}
              className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => {
                audioManager.playSound('click');
                setShowStats(true);
              }}
              className="px-8 py-6 text-lg border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Statistics
            </Button>
          </div>

          <LevelSelector 
            playerStats={playerStats}
            onLevelSelect={(level) => {
              audioManager.playSound('click');
              setGameStarted(true);
              handleLevelChange(level);
            }}
          />

          {showStats && (
            <div className="mt-8">
              <PlayerStats stats={playerStats} />
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    audioManager.playSound('click');
                    setShowStats(false);
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Hide Statistics
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              WordMaster
            </h1>
            
            {/* Developer Credits - Game screen */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>Crafted by</span>
                <span className="font-semibold text-purple-300">Hitesha</span>
                <span className="text-purple-400">&</span>
                <span className="font-semibold text-blue-300">Parshad</span>
                <Heart className="w-4 h-4 text-red-400" />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  audioManager.playSound('click');
                  setShowStats(!showStats);
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  audioManager.playSound('click');
                  handleNewGame();
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                New Game
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  audioManager.playSound('click');
                  setGameStarted(false);
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </div>
          </div>
          
          <UserProfile user={user} stats={playerStats} onSignOut={handleSignOut} onUserUpdate={handleUserUpdate} />
        </div>

        {showStats && <PlayerStats stats={playerStats} />}

        {currentSession && gameState.gameStatus === 'playing' && (
          <RealTimeStats gameState={gameState} session={currentSession} />
        )}

        {/* Timer Component */}
        <GameTimer
          level={gameState.currentLevel}
          gameStatus={gameState.gameStatus}
          onTimeUp={handleTimeUp}
          timeRemaining={gameState.timeRemaining}
          onTimeUpdate={handleTimeUpdate}
        />

        {gameState.gameStatus === 'playing' ? (
          <>
            <GameBoard gameState={gameState} />
            <GameStats gameState={gameState} wrongLetters={wrongLetters} />
            <GuessInput
              onGuess={handleGuess}
              guessedLetters={gameState.guessedLetters}
              disabled={gameState.gameStatus !== 'playing'}
            />
          </>
        ) : (
          <GameOver
            gameState={gameState}
            onNewGame={handleNewGame}
            onLevelChange={handleLevelChange}
            unlockedLevels={playerStats.unlockedLevels}
            levelUnlocked={levelUnlocked}
            pointsEarned={currentPoints}
          />
        )}
      </div>
    </div>
  );
}