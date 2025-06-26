"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Keyboard } from 'lucide-react';

interface GuessInputProps {
  onGuess: (letter: string) => void;
  guessedLetters: string[];
  disabled: boolean;
}

export function GuessInput({ onGuess, guessedLetters, disabled }: GuessInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const letter = inputValue.toLowerCase().trim();
    
    if (letter && letter.length === 1 && /[a-z]/.test(letter) && !guessedLetters.includes(letter)) {
      onGuess(letter);
      setInputValue('');
    }
  };

  const handleKeyboardGuess = (letter: string) => {
    if (!disabled && !guessedLetters.includes(letter)) {
      onGuess(letter);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      
      const letter = e.key.toLowerCase();
      if (/[a-z]/.test(letter) && letter.length === 1 && !guessedLetters.includes(letter)) {
        onGuess(letter);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [onGuess, guessedLetters, disabled]);

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const getLetterStatus = (letter: string) => {
    if (!guessedLetters.includes(letter)) return 'available';
    // This would need to be determined by checking if the letter is in the word
    // For now, we'll just mark as guessed
    return 'guessed';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a letter or click below..."
              maxLength={1}
              disabled={disabled}
              className="flex-1 text-center text-xl h-14 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
            />
            <Button 
              type="submit" 
              disabled={disabled || !inputValue.trim() || guessedLetters.includes(inputValue.toLowerCase())}
              className="px-8 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          
          {/* Virtual Keyboard */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Keyboard className="w-4 h-4" />
              <span>Click letters or use your keyboard</span>
            </div>
            
            <div className="grid grid-cols-6 md:grid-cols-13 gap-2">
              {alphabet.map(letter => {
                const isGuessed = guessedLetters.includes(letter);
                const status = getLetterStatus(letter);
                
                return (
                  <Button
                    key={letter}
                    variant="outline"
                    size="sm"
                    onClick={() => handleKeyboardGuess(letter)}
                    disabled={disabled || isGuessed}
                    className={`aspect-square text-sm font-bold transition-all duration-200 ${
                      isGuessed 
                        ? 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 hover:border-slate-500 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {letter.toUpperCase()}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Hint */}
          <div className="text-center text-slate-400 text-sm">
            💡 Tip: Use your physical keyboard for faster gameplay!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}