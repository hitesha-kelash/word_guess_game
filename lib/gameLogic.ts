import { DifficultyLevel, GameStats } from '@/types/game';
import wordsData from '@/data/words.json';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  basic: 'Basic',
  medium: 'Medium',
  advance: 'Advance',
  pro: 'Pro'
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  basic: 'bg-green-500',
  medium: 'bg-blue-500',
  advance: 'bg-orange-500',
  pro: 'bg-red-500'
};

export const POINTS_SYSTEM = {
  basic: { win: 50, lose: -10 },
  medium: { win: 100, lose: -20 },
  advance: { win: 200, lose: -30 },
  pro: { win: 500, lose: -50 }
};

export const STARTING_POINTS = 1000;

export function getRandomWord(level: DifficultyLevel): string {
  const words = wordsData[level];
  return words[Math.floor(Math.random() * words.length)].toLowerCase();
}

export function calculateWordStats(word: string): GameStats {
  const vowels = 'aeiou';
  const letters = word.toLowerCase().split('');
  const letterCounts: Record<string, number> = {};
  
  let vowelCount = 0;
  let consonantCount = 0;
  let repeatedLetterCount = 0;

  // Count letter occurrences
  letters.forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    
    if (vowels.includes(letter)) {
      vowelCount++;
    } else {
      consonantCount++;
    }
  });

  // Count unique letters that appear more than once
  Object.values(letterCounts).forEach(count => {
    if (count > 1) {
      repeatedLetterCount++;
    }
  });

  return {
    vowelCount,
    consonantCount,
    repeatedLetterCount
  };
}

export function isWordComplete(word: string, guessedLetters: string[]): boolean {
  return word.split('').every(letter => guessedLetters.includes(letter));
}

export function shouldUnlockNextLevel(level: DifficultyLevel, wins: number): boolean {
  const requirements: Record<DifficultyLevel, number> = {
    basic: 0,    // Always unlocked
    medium: 3,   // Need 3 basic wins
    advance: 5,   // Need 5 medium wins
    pro: 7       // Need 7 advance wins
  };

  return wins >= requirements[level];
}

export function getNextLevel(currentLevel: DifficultyLevel): DifficultyLevel | null {
  const levels: DifficultyLevel[] = ['basic', 'medium', 'advance', 'pro'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

export function calculatePoints(level: DifficultyLevel, won: boolean, guessCount: number, maxGuesses: number): number {
  const basePoints = POINTS_SYSTEM[level][won ? 'win' : 'lose'];
  
  if (won) {
    // Bonus points for fewer guesses
    const efficiency = (maxGuesses - guessCount) / maxGuesses;
    const bonusMultiplier = 1 + (efficiency * 0.5); // Up to 50% bonus
    return Math.round(basePoints * bonusMultiplier);
  }
  
  return basePoints;
}