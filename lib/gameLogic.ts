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
  basic: { win: 150, lose: -30 },
  medium: { win: 300, lose: -60 },
  advance: { win: 600, lose: -120 },
  pro: { win: 1200, lose: -240 }
};

export const UNLOCK_REQUIREMENTS = {
  basic: 0,     // Always unlocked
  medium: 8,    // Need 8 basic wins
  advance: 15,  // Need 15 medium wins
  pro: 25       // Need 25 advance wins
};

// Point thresholds for rank progression
export const RANK_THRESHOLDS = {
  beginner: 0,
  novice: 2000,
  intermediate: 5000,
  advanced: 10000,
  expert: 20000,
  master: 35000,
  grandmaster: 50000,
  legend: 75000
};

export const STARTING_POINTS = 1000;
export const NEW_ACCOUNT_BONUS = 1000;

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
  const nextLevel = getNextLevel(level);
  if (!nextLevel) return false;
  return wins >= UNLOCK_REQUIREMENTS[nextLevel];
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
    const bonusMultiplier = 1 + (efficiency * 1.2); // Up to 120% bonus
    return Math.round(basePoints * bonusMultiplier);
  }
  
  return basePoints;
}

export function getPointsColor(points: number): string {
  if (points >= RANK_THRESHOLDS.legend) return 'text-purple-600';
  if (points >= RANK_THRESHOLDS.grandmaster) return 'text-pink-600';
  if (points >= RANK_THRESHOLDS.master) return 'text-blue-600';
  if (points >= RANK_THRESHOLDS.expert) return 'text-emerald-600';
  if (points >= RANK_THRESHOLDS.advanced) return 'text-amber-600';
  if (points >= RANK_THRESHOLDS.intermediate) return 'text-orange-600';
  if (points >= RANK_THRESHOLDS.novice) return 'text-cyan-600';
  return 'text-slate-600';
}

export function getPointsGradient(points: number): string {
  if (points >= RANK_THRESHOLDS.legend) return 'from-purple-500 to-pink-500';
  if (points >= RANK_THRESHOLDS.grandmaster) return 'from-pink-500 to-rose-500';
  if (points >= RANK_THRESHOLDS.master) return 'from-blue-500 to-cyan-500';
  if (points >= RANK_THRESHOLDS.expert) return 'from-emerald-500 to-teal-500';
  if (points >= RANK_THRESHOLDS.advanced) return 'from-amber-500 to-orange-500';
  if (points >= RANK_THRESHOLDS.intermediate) return 'from-orange-500 to-red-500';
  if (points >= RANK_THRESHOLDS.novice) return 'from-cyan-500 to-blue-500';
  return 'from-slate-500 to-slate-600';
}

export function getRank(points: number): { name: string; icon: string; nextRank?: string; pointsToNext?: number } {
  const ranks = [
    { threshold: RANK_THRESHOLDS.legend, name: 'Legend', icon: '🌟' },
    { threshold: RANK_THRESHOLDS.grandmaster, name: 'Grandmaster', icon: '👑' },
    { threshold: RANK_THRESHOLDS.master, name: 'Master', icon: '🏆' },
    { threshold: RANK_THRESHOLDS.expert, name: 'Expert', icon: '⭐' },
    { threshold: RANK_THRESHOLDS.advanced, name: 'Advanced', icon: '🎯' },
    { threshold: RANK_THRESHOLDS.intermediate, name: 'Intermediate', icon: '📚' },
    { threshold: RANK_THRESHOLDS.novice, name: 'Novice', icon: '🎓' },
    { threshold: RANK_THRESHOLDS.beginner, name: 'Beginner', icon: '🌱' }
  ];

  for (let i = 0; i < ranks.length; i++) {
    if (points >= ranks[i].threshold) {
      const nextRank = i > 0 ? ranks[i - 1] : null;
      return {
        ...ranks[i],
        nextRank: nextRank?.name,
        pointsToNext: nextRank ? nextRank.threshold - points : undefined
      };
    }
  }

  return ranks[ranks.length - 1];
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

export function calculateLevelUpBonus(newLevel: DifficultyLevel): number {
  const bonuses = {
    medium: 500,
    advance: 1000,
    pro: 2000
  };
  return bonuses[newLevel] || 0;
}