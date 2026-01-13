import { motion } from 'framer-motion';
import type { LotteryNumber } from '../types';
import './LotteryDisplay.css';

interface LotteryDisplayProps {
  title: string;
  prizeName: string;
  numbers: LotteryNumber[] | null;
}

/**
 * 大屏数字展示
 */
export function LotteryDisplay({ title, prizeName, numbers }: LotteryDisplayProps) {
  return (
    <section className="lottery-display-container">
      <div className="lottery-title">{title}</div>
      <div className="lottery-prize">{prizeName}</div>
      <p className="lottery-subtitle">恭喜以下获奖人员</p>

      <div
        className={`numbers-wrapper ${
          numbers && numbers.length > 6 ? 'scrollable' : ''
        }`}
      >
        {numbers && numbers.length > 0 ? (
          numbers.map((num, index) => (
            <motion.div
              key={`${num}-${index}`}
              className="number-card"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
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

