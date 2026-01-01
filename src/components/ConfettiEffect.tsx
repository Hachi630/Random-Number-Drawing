import { useEffect, useState } from 'react';
import './ConfettiEffect.css';

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
}

/**
 * 庆祝特效组件 - 爆炸碎屑效果
 */
export function ConfettiEffect({ trigger, duration = 2000 }: ConfettiEffectProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!isActive) return null;

  return (
    <div className="confetti-container">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff8b94', '#95e1d3'][
              Math.floor(Math.random() * 5)
            ],
          }}
        />
      ))}
    </div>
  );
}

