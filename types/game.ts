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
  gameStatus: 'playing' | 'won' | 'lost';
  currentLevel: DifficultyLevel;
  stats: GameStats;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  levelStats: Record<DifficultyLevel, {
    played: number;
    won: number;
    bestStreak: number;
  }>;
  unlockedLevels: DifficultyLevel[];
}