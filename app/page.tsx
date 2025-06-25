"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GameState, PlayerStats as PlayerStatsType, DifficultyLevel, User, GameSession } from '@/types/game';
import { 
  getRandomWord, 
  calculateWordStats, 
  isWordComplete, 
  shouldUnlockNextLevel,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  getNextLevel,
  calculatePoints,
  STARTING_POINTS
} from '@/lib/gameLogic';
import { Gamepad2, BarChart3, Play, Code2, Heart, User as UserIcon } from 'lucide-react';

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

  const createInitialGameState = useCallback((level: DifficultyLevel = 'basic'): GameState => {
    const word = getRandomWord(level);
    return {
      currentWord: word,
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongGuesses: 10,
      gameStatus: 'playing',
      currentLevel: level,
      stats: calculateWordStats(word)
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState('basic'));

  const handleGuess = useCallback((letter: string) => {
    if (gameState.gameStatus !== 'playing' || gameState.guessedLetters.includes(letter)) {
      return;
    }

    setGameState(prev => {
      const newGuessedLetters = [...prev.guessedLetters, letter];
      const isCorrect = prev.currentWord.includes(letter);
      const newWrongGuesses = isCorrect ? prev.wrongGuesses : prev.wrongGuesses + 1;
      
      let newStatus: 'playing' | 'won' | 'lost' = 'playing';
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

  // Update session points in real-time
  useEffect(() => {
    if (currentSession && gameState.gameStatus === 'playing') {
      const points = calculatePoints(
        gameState.currentLevel, 
        true, 
        gameState.guessedLetters.length, 
        gameState.maxWrongGuesses
      );
      setCurrentSession(prev => prev ? { ...prev, pointsEarned: points } : null);
    }
  }, [gameState.guessedLetters, gameState.currentLevel, gameState.maxWrongGuesses, currentSession]);

  // Update player stats when game ends
  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      const isWon = gameState.gameStatus === 'won';
      const points = calculatePoints(
        gameState.currentLevel, 
        isWon, 
        gameState.guessedLetters.length, 
        gameState.maxWrongGuesses
      );
      
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
        if (isWon) levelStat.won += 1;

        // Check for level unlock
        const nextLevel = getNextLevel(gameState.currentLevel);
        if (nextLevel && !newStats.unlockedLevels.includes(nextLevel)) {
          if (shouldUnlockNextLevel(gameState.currentLevel, levelStat.won)) {
            newStats.unlockedLevels.push(nextLevel);
            setLevelUnlocked(nextLevel);
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
          guessCount: gameState.guessedLetters.length
        } : null);
      }
    }
  }, [gameState.gameStatus, gameState.currentLevel, gameState.guessedLetters.length, gameState.maxWrongGuesses, setPlayerStats, currentSession]);

  const handleNewGame = useCallback((level?: DifficultyLevel) => {
    const newLevel = level || gameState.currentLevel;
    setGameState(createInitialGameState(newLevel));
    setLevelUnlocked(null);
    
    // Create new session
    setCurrentSession({
      startTime: Date.now(),
      pointsEarned: 0,
      level: newLevel,
      won: false,
      word: '',
      guessCount: 0
    });
  }, [gameState.currentLevel, createInitialGameState]);

  const handleLevelChange = useCallback((level: DifficultyLevel) => {
    if (playerStats.unlockedLevels.includes(level)) {
      setGameState(createInitialGameState(level));
      setLevelUnlocked(null);
      
      // Create new session
      setCurrentSession({
        startTime: Date.now(),
        pointsEarned: 0,
        level: level,
        won: false,
        word: '',
        guessCount: 0
      });
    }
  }, [playerStats.unlockedLevels, createInitialGameState]);

  const handleAuth = (newUser: User) => {
    setUser(newUser);
    // Initialize stats with starting points if new user
    if (playerStats.totalPoints === STARTING_POINTS && playerStats.gamesPlayed === 0) {
      setPlayerStats(prev => ({ ...prev, totalPoints: STARTING_POINTS }));
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setGameStarted(false);
    setShowStats(false);
  };

  const wrongLetters = gameState.guessedLetters.filter(letter => 
    !gameState.currentWord.includes(letter)
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Word Guessing Game
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Challenge yourself with four difficulty levels! Sign in to track your progress, earn points, and compete with others.
            </p>

            {/* Developer Credits */}
            <div className="mb-8">
              <Card className="max-w-md mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Code2 className="w-5 h-5 text-purple-600" />
                    <span className="text-lg font-semibold text-purple-800">Crafted with</span>
                    <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-700 mb-2">Developed by</p>
                    <div className="flex justify-center gap-3">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-medium">
                        Hitesha
                      </Badge>
                      <span className="text-purple-600 font-bold text-lg">&</span>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-medium">
                        Parshad
                      </Badge>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 italic">
                      Building amazing experiences, one word at a time
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg" 
              onClick={() => setShowAuth(true)}
              className="px-8 py-6 text-lg"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Sign In to Play
            </Button>
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          onAuth={handleAuth}
        />
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Word Guessing Game
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Challenge yourself with four difficulty levels! Guess the hidden word using the given hints. 
                You have 10 wrong guesses before the game ends.
              </p>
            </div>
            
            <UserProfile user={user} stats={playerStats} onSignOut={handleSignOut} />
          </div>

          {/* Developer Credits */}
          <div className="mb-8">
            <Card className="max-w-md mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Code2 className="w-5 h-5 text-purple-600" />
                  <span className="text-lg font-semibold text-purple-800">Crafted with</span>
                  <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-purple-700 mb-2">Developed by</p>
                  <div className="flex justify-center gap-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-medium">
                      Hitesha
                    </Badge>
                    <span className="text-purple-600 font-bold text-lg">&</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-medium">
                      Parshad
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-600 mt-2 italic">
                    Building amazing experiences, one word at a time
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={() => {
                setGameStarted(true);
                handleNewGame();
              }}
              className="px-8 py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setShowStats(true)}
              className="px-8 py-6 text-lg"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Stats
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {(['basic', 'medium', 'advance', 'pro'] as DifficultyLevel[]).map(level => {
              const isUnlocked = playerStats.unlockedLevels.includes(level);
              const stats = playerStats.levelStats[level];
              
              return (
                <Card key={level} className={`${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                  <CardContent className="p-4 text-center">
                    <Badge className={`${DIFFICULTY_COLORS[level]} text-white mb-2`}>
                      {DIFFICULTY_LABELS[level]}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {isUnlocked ? `${stats.won}/${stats.played} won` : 'Locked'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isUnlocked ? `${stats.pointsEarned} pts` : ''}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {showStats && (
            <div className="mt-8">
              <PlayerStats stats={playerStats} />
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStats(false)}
                >
                  Hide Stats
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-start mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Word Guessing Game
            </h1>
            
            {/* Developer Credits - Compact version for game screen */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Code2 className="w-4 h-4 text-purple-500" />
                <span>Crafted by</span>
                <span className="font-semibold text-purple-600">Hitesha</span>
                <span className="text-purple-500">&</span>
                <span className="font-semibold text-blue-600">Parshad</span>
                <Heart className="w-4 h-4 text-red-500" />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleNewGame()}>
                New Game
              </Button>
            </div>
          </div>
          
          <UserProfile user={user} stats={playerStats} onSignOut={handleSignOut} />
        </div>

        {showStats && <PlayerStats stats={playerStats} />}

        {currentSession && gameState.gameStatus === 'playing' && (
          <RealTimeStats gameState={gameState} session={currentSession} />
        )}

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
          />
        )}
      </div>
    </div>
  );
}