import { DifficultyLevel, GameStats } from '@/types/game';
import wordsData from '@/data/words.json';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  basic: 'Basic',
  medium: 'Medium',
  advance: 'Advanced',
  pro: 'Professional'
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  basic: 'bg-emerald-500',
  medium: 'bg-blue-500',
  advance: 'bg-amber-500',
  pro: 'bg-red-500'
};

export const DIFFICULTY_GRADIENTS: Record<DifficultyLevel, string> = {
  basic: 'from-emerald-400 to-emerald-600',
  medium: 'from-blue-400 to-blue-600',
  advance: 'from-amber-400 to-amber-600',
  pro: 'from-red-400 to-red-600'
};

export const POINTS_SYSTEM = {
  basic: { win: 100, lose: -25 },
  medium: { win: 250, lose: -50 },
  advance: { win: 500, lose: -100 },
  pro: { win: 1000, lose: -200 }
};

export const UNLOCK_REQUIREMENTS = {
  basic: 0,     // Always unlocked
  medium: 5,    // Need 5 basic wins
  advance: 8,   // Need 8 medium wins
  pro: 12       // Need 12 advance wins
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
  return wins >= UNLOCK_REQUIREMENTS[level];
}

export function getNextLevel(currentLevel: DifficultyLevel): DifficultyLevel | null {
  const levels: DifficultyLevel[] = ['basic', 'medium', 'advance', 'pro'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

export function calculatePoints(level: DifficultyLevel, won: boolean, guessCount: number, maxGuesses: number): number {
  const basePoints = POINTS_SYSTEM[level][won ? 'win' : 'lose'];
  
  if (won) {
    // Bonus points for efficiency (fewer guesses)
    const efficiency = Math.max(0, (maxGuesses - guessCount) / maxGuesses);
    const bonusMultiplier = 1 + (efficiency * 0.8); // Up to 80% bonus
    return Math.round(basePoints * bonusMultiplier);
  }
  
  return basePoints;
}

export function getPointsColor(points: number): string {
  if (points >= 5000) return 'text-purple-600';
  if (points >= 3000) return 'text-blue-600';
  if (points >= 1500) return 'text-emerald-600';
  if (points >= 500) return 'text-amber-600';
  return 'text-red-600';
}

export function getPointsGradient(points: number): string {
  if (points >= 5000) return 'from-purple-500 to-pink-500';
  if (points >= 3000) return 'from-blue-500 to-cyan-500';
  if (points >= 1500) return 'from-emerald-500 to-teal-500';
  if (points >= 500) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-500';
}

export function getLevelProgress(level: DifficultyLevel, wins: number): { current: number; required: number; percentage: number } {
  const nextLevel = getNextLevel(level);
  if (!nextLevel) {
    return { current: wins, required: wins, percentage: 100 };
  }
  
  const required = UNLOCK_REQUIREMENTS[nextLevel];
  const percentage = Math.min(100, (wins / required) * 100);
  
  return { current: wins, required, percentage };
}