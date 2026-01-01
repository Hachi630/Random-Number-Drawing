import { useState, useCallback } from 'react';
import { LotteryPool } from '../utils/lotteryPool';
import type { LotteryNumber, DrawRecord } from '../types';

/**
 * 奖池管理 Hook
 * 封装奖池逻辑和状态管理
 */
export function useLotteryPool(
  minNumber: number = 1,
  maxNumber: number = 300,
  blacklist: LotteryNumber[] = [],
  whitelist: LotteryNumber[] = []
) {
  const [pool] = useState(() => 
    new LotteryPool(minNumber, maxNumber, blacklist, whitelist)
  );
  const [currentNumber, setCurrentNumber] = useState<LotteryNumber | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<LotteryNumber[]>([]);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [remainingCount, setRemainingCount] = useState(pool.getRemainingCount());

  // 更新剩余数量
  const updateRemainingCount = useCallback(() => {
    setRemainingCount(pool.getRemainingCount());
  }, [pool]);

  // 抽取单个号码
  const draw = useCallback((): LotteryNumber | null => {
    const number = pool.draw();
    if (number !== null) {
      setCurrentNumber(number);
      setDrawnNumbers(pool.getDrawnNumbers());
      setDrawHistory(pool.getDrawHistory());
      updateRemainingCount();
      return number;
    }
    return null;
  }, [pool, updateRemainingCount]);

  // 批量抽取
  const drawMultiple = useCallback((count: number): LotteryNumber[] => {
    const numbers = pool.drawMultiple(count);
    if (numbers.length > 0) {
      setCurrentNumber(numbers[numbers.length - 1]); // 显示最后一个
      setDrawnNumbers(pool.getDrawnNumbers());
      setDrawHistory(pool.getDrawHistory());
      updateRemainingCount();
    }
    return numbers;
  }, [pool, updateRemainingCount]);

  // 重置奖池
  const reset = useCallback((
    newMinNumber: number = minNumber,
    newMaxNumber: number = maxNumber,
    newBlacklist: LotteryNumber[] = [],
    newWhitelist: LotteryNumber[] = []
  ) => {
    pool.reset(newMinNumber, newMaxNumber, newBlacklist, newWhitelist);
    setCurrentNumber(null);
    setDrawnNumbers([]);
    setDrawHistory([]);
    updateRemainingCount();
  }, [pool, minNumber, maxNumber, updateRemainingCount]);

  // 恢复状态
  const restore = useCallback((
    drawnNumbers: LotteryNumber[],
    remainingNumbers: LotteryNumber[],
    drawHistory?: DrawRecord[]
  ) => {
    pool.restoreState(drawnNumbers, remainingNumbers, drawHistory);
    setDrawnNumbers(drawnNumbers);
    setRemainingCount(remainingNumbers.length);
    if (drawHistory) {
      setDrawHistory(drawHistory);
    }
  }, [pool]);

  // 更新黑白名单（需要重置）
  const updateLists = useCallback((
    newBlacklist: LotteryNumber[],
    newWhitelist: LotteryNumber[]
  ) => {
    // 保存已抽取的号码
    const currentDrawn = [...drawnNumbers];
    
    // 重置奖池
    pool.reset(minNumber, maxNumber, newBlacklist, newWhitelist);
    
    // 恢复已抽取的号码（从新池中移除）
    currentDrawn.forEach(num => {
      if (pool.isAvailable(num)) {
        // 如果号码在新池中，移除它
        const remaining = pool.getRemainingNumbers();
        const filtered = remaining.filter(n => n !== num);
        pool.restoreState(currentDrawn, filtered);
      }
    });
    
    setRemainingCount(pool.getRemainingCount());
  }, [pool, minNumber, maxNumber, drawnNumbers]);

  return {
    pool,
    currentNumber,
    drawnNumbers,
    drawHistory,
    remainingCount,
    draw,
    drawMultiple,
    reset,
    restore,
    updateLists,
    getRemainingNumbers: () => pool.getRemainingNumbers(),
  };
}

