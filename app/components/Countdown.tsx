'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  targetTime: Date;
  onComplete?: () => void;
}

export default function Countdown({ targetTime, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      // Calculate time parts
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };
    
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Setup timer
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);
    
    // Cleanup timer
    return () => clearInterval(timer);
  }, [targetTime, onComplete]);
  
  if (isComplete) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">Game is starting!</h2>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Game starts at 12:00 PM ET</h1>
      <div className="text-5xl font-mono font-bold">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
      <p className="mt-4 text-lg">
        Keep your finger on the button when the game starts!
      </p>
    </div>
  );
} 