"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';

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

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a letter..."
            maxLength={1}
            disabled={disabled}
            className="flex-1 text-center text-lg"
          />
          <Button 
            type="submit" 
            disabled={disabled || !inputValue.trim() || guessedLetters.includes(inputValue.toLowerCase())}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="grid grid-cols-6 md:grid-cols-13 gap-2">
          {alphabet.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            return (
              <Button
                key={letter}
                variant={isGuessed ? "secondary" : "outline"}
                size="sm"
                onClick={() => !disabled && !isGuessed && onGuess(letter)}
                disabled={disabled || isGuessed}
                className={`aspect-square text-sm font-medium ${
                  isGuessed ? 'opacity-50' : 'hover:scale-105 transition-transform'
                }`}
              >
                {letter.toUpperCase()}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}