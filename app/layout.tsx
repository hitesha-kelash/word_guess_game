import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Guessing Game - Challenge Your Vocabulary',
  description: 'A beautiful word guessing game with four difficulty levels. Test your vocabulary skills and unlock new challenges!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}