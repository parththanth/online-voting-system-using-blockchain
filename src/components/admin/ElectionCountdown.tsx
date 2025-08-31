
import { useState, useEffect } from "react";

interface ElectionCountdownProps {
  endTime: Date;
}

const ElectionCountdown = ({ endTime }: ElectionCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="font-mono text-xl font-bold">
      {String(timeRemaining.hours).padStart(2, '0')}:
      {String(timeRemaining.minutes).padStart(2, '0')}:
      {String(timeRemaining.seconds).padStart(2, '0')}
    </div>
  );
};

export default ElectionCountdown;
