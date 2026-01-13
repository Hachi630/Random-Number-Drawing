import { useEffect, useState, useCallback } from 'react';
import type {
  LotteryNumber,
  DrawRecord,
  PrizeConfig,
  PrizeId,
  StoredData,
} from '../types';

const STORAGE_KEY = 'lottery-system-data';

/**
 * 本地存储管理 Hook
 * 负责数据的持久化和恢复
 */
export function useLocalStorage() {
  const [hasStoredData, setHasStoredData] = useState(false);

  // 检查是否有存储的数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHasStoredData(!!stored);
  }, []);

  /**
   * 保存数据到本地存储
   */
  const saveData = useCallback((
    drawnNumbers: LotteryNumber[],
    remainingNumbers: LotteryNumber[],
    blacklist: LotteryNumber[],
    whitelist: LotteryNumber[],
    drawHistory: DrawRecord[],
    minNumber: number,
    maxNumber: number,
    prizeState: PrizeConfig[],
    currentPrize: PrizeId,
    drawCount: number,
  ) => {
    const data: StoredData = {
      minNumber,
      maxNumber,
      drawnNumbers,
      remainingNumbers,
      blacklist,
      whitelist,
      drawHistory,
      prizeState,
      currentPrize,
      drawCount,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setHasStoredData(true);
  }, []);

  /**
   * 从本地存储加载数据
   */
  const loadData = useCallback((): StoredData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored) as StoredData;
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return null;
    }
  }, []);

  /**
   * 清除本地存储的数据
   */
  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasStoredData(false);
  }, []);

  /**
   * 更新存储的数据（部分更新）
   */
  const updateData = useCallback((
    drawnNumbers?: LotteryNumber[],
    remainingNumbers?: LotteryNumber[],
    blacklist?: LotteryNumber[],
    whitelist?: LotteryNumber[],
    drawHistory?: DrawRecord[],
    minNumber?: number,
    maxNumber?: number,
    prizeState?: PrizeConfig[],
    currentPrize?: PrizeId,
    drawCount?: number,
  ) => {
    const currentData = loadData();
    if (!currentData) {
      // 如果没有现有数据，创建新数据
      if (
        drawnNumbers &&
        remainingNumbers &&
        minNumber !== undefined &&
        maxNumber !== undefined &&
        prizeState &&
        currentPrize !== undefined &&
        drawCount !== undefined
      ) {
        saveData(
          drawnNumbers,
          remainingNumbers,
          blacklist || [],
          whitelist || [],
          drawHistory || [],
          minNumber,
          maxNumber,
          prizeState,
          currentPrize,
          drawCount,
        );
      }
      return;
    }

    // 合并更新
    saveData(
      drawnNumbers ?? currentData.drawnNumbers,
      remainingNumbers ?? currentData.remainingNumbers,
      blacklist ?? currentData.blacklist,
      whitelist ?? currentData.whitelist,
      drawHistory ?? currentData.drawHistory,
      minNumber ?? currentData.minNumber,
      maxNumber ?? currentData.maxNumber,
      prizeState ?? currentData.prizeState,
      currentPrize ?? currentData.currentPrize ?? 'happiness',
      drawCount ?? currentData.drawCount ?? 1,
    );
  }, [loadData, saveData]);

  return {
    hasStoredData,
    saveData,
    loadData,
    clearData,
    updateData,
  };
}

