import { motion } from 'framer-motion';
import type { LotteryNumber } from '../types';
import './LotteryDisplay.css';

interface LotteryDisplayProps {
  title: string;
  prizeName: string;
  numbers: LotteryNumber[] | null;
  isRolling?: boolean;
}

/**
 * 大屏数字展示
 */
export function LotteryDisplay({ title, prizeName, numbers, isRolling = false }: LotteryDisplayProps) {
  return (
    <section className="lottery-display-container">
      <div className="lottery-title">{title}</div>
      <div className="lottery-prize">{prizeName}</div>
      <p className="lottery-subtitle">
        {isRolling ? '正在抽奖中，请点击停止...' : '恭喜以下获奖人员'}
      </p>

      <div
        className={`numbers-wrapper ${
          numbers && numbers.length > 6 ? 'scrollable' : ''
        } ${isRolling ? 'rolling' : ''}`}
      >
        {numbers && numbers.length > 0 ? (
          numbers.map((num, index) => (
            <motion.div
              key={isRolling ? `rolling-${index}` : `${num}-${index}`}
              className={`number-card ${isRolling ? 'rolling-number' : ''}`}
              initial={isRolling ? false : { opacity: 0, scale: 0.6 }}
              animate={
                isRolling
                  ? {
                      opacity: [0.8, 1, 0.8],
                      scale: [0.95, 1.05, 0.95],
                    }
                  : { opacity: 1, scale: 1 }
              }
              transition={
                isRolling
                  ? {
                      duration: 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : { delay: index * 0.08 }
              }
            >
              <span>{num}</span>
            </motion.div>
          ))
        ) : (
          <div className="number-placeholder">点击下方开始抽奖</div>
        )}
      </div>
    </section>
  );
}

