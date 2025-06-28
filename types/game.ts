export type DifficultyLevel = 'basic' | 'medium' | 'advance' | 'pro';

export interface GameStats {
  vowelCount: number;
  consonantCount: number;
  repeatedLetterCount: number;
}

export interface GameState {
  currentWord: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost' | 'timeout';
  currentLevel: DifficultyLevel;
  stats: GameStats;
  timeRemaining: number;
  gameStartTime: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  joinedAt: string;
  isGuest: boolean;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  levelStats: Record<DifficultyLevel, {
    played: number;
    won: number;
    bestStreak: number;
    pointsEarned: number;
  }>;
  unlockedLevels: DifficultyLevel[];
}

export interface GameSession {
  startTime: number;
  endTime?: number;
  pointsEarned: number;
  level: DifficultyLevel;
  won: boolean;
  word: string;
  guessCount: number;
  completedInTime: boolean;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
}