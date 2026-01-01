import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LotteryNumber } from '../types';
import './LotteryDisplay.css';

interface LotteryDisplayProps {
  currentNumber: LotteryNumber | null;
  multipleNumbers?: LotteryNumber[];
  isRolling?: boolean;
  onRollComplete?: () => void;
  animationDuration?: number;
  maxNumber?: number;
}

/**
 * 中心数字滚动显示组件
 * 实现老虎机式的滚动动画效果
 */
export function LotteryDisplay({
  currentNumber,
  multipleNumbers,
  isRolling,
  onRollComplete,
  animationDuration = 2500,
  maxNumber = 300,
}: LotteryDisplayProps) {
  const [displayNumber, setDisplayNumber] = useState<LotteryNumber | null>(currentNumber);

  useEffect(() => {
    setDisplayNumber(currentNumber);
  }, [currentNumber]);

  // 如果有多个数字，显示多个数字
  if (multipleNumbers && multipleNumbers.length > 0) {
    return (
      <div className="lottery-display-container">
        <div className="multiple-numbers-container">
          {multipleNumbers.map((num, index) => (
            <motion.div
              key={`${num}-${index}`}
              className="multiple-number-item"
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
            >
              <span className="number-text multiple-number-text">{num}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="celebration-ring"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1.5, 1.8], opacity: [1, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    );
  }

  return (
    <div className="lottery-display-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayNumber ?? 'empty'}
          className="lottery-number"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {displayNumber !== null && (
            <span className="number-text">{displayNumber}</span>
          )}
        </motion.div>
      </AnimatePresence>
      
      {displayNumber !== null && (
        <motion.div
          className="celebration-ring"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1.5, 1.8], opacity: [1, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}

