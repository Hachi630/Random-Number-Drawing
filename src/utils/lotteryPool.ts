import type { LotteryNumber, DrawRecord } from '../types';
import { getRandomInt } from './randomGenerator';

/**
 * 奖池管理类
 * 负责管理号码池、抽取逻辑和去重保证
 */
export class LotteryPool {
  private pool: Set<LotteryNumber>;
  private drawnNumbers: LotteryNumber[];
  private drawHistory: DrawRecord[];

  constructor(
    minNumber: number = 1,
    maxNumber: number = 300,
    blacklist: LotteryNumber[] = [],
    whitelist: LotteryNumber[] = []
  ) {
    // 初始化号码池
    const allNumbers: LotteryNumber[] = [];
    for (let i = minNumber; i <= maxNumber; i++) {
      allNumbers.push(i);
    }

    // 应用白名单：如果指定了白名单，只使用白名单中的号码
    let availableNumbers = whitelist.length > 0 
      ? allNumbers.filter(num => whitelist.includes(num))
      : allNumbers;

    // 应用黑名单：排除黑名单中的号码
    availableNumbers = availableNumbers.filter(num => !blacklist.includes(num));

    this.pool = new Set(availableNumbers);
    this.drawnNumbers = [];
    this.drawHistory = [];
  }

  /**
   * 从奖池中抽取一个号码
   * @returns 抽取的号码，如果奖池为空则返回 null
   */
  draw(): LotteryNumber | null {
    if (this.pool.size === 0) {
      return null;
    }

    const numbers = Array.from(this.pool);
    const randomIndex = getRandomInt(0, numbers.length - 1);
    const drawnNumber = numbers[randomIndex];

    // 从池中移除
    this.pool.delete(drawnNumber);
    this.drawnNumbers.push(drawnNumber);

    // 记录历史
    this.drawHistory.push({
      numbers: [drawnNumber],
      timestamp: Date.now(),
    });

    return drawnNumber;
  }

  /**
   * 批量抽取多个号码
   * @param count 要抽取的数量
   * @returns 抽取的号码数组
   */
  drawMultiple(count: number): LotteryNumber[] {
    const results: LotteryNumber[] = [];
    const availableCount = Math.min(count, this.pool.size);

    for (let i = 0; i < availableCount; i++) {
      const number = this.draw();
      if (number !== null) {
        results.push(number);
      }
    }

    // 如果批量抽取，更新最后一次历史记录
    if (results.length > 0) {
      this.drawHistory[this.drawHistory.length - 1] = {
        numbers: results,
        timestamp: Date.now(),
      };
    }

    return results;
  }

  /**
   * 获取剩余号码数量
   */
  getRemainingCount(): number {
    return this.pool.size;
  }

  /**
   * 获取已抽取的号码列表
   */
  getDrawnNumbers(): LotteryNumber[] {
    return [...this.drawnNumbers];
  }

  /**
   * 获取剩余号码列表
   */
  getRemainingNumbers(): LotteryNumber[] {
    return Array.from(this.pool);
  }

  /**
   * 获取抽奖历史
   */
  getDrawHistory(): DrawRecord[] {
    return [...this.drawHistory];
  }

  /**
   * 检查号码是否已被抽取
   */
  isDrawn(number: LotteryNumber): boolean {
    return this.drawnNumbers.includes(number);
  }

  /**
   * 检查号码是否在剩余池中
   */
  isAvailable(number: LotteryNumber): boolean {
    return this.pool.has(number);
  }

  /**
   * 从已抽取的号码恢复状态（用于数据恢复）
   */
  restoreState(
    drawnNumbers: LotteryNumber[], 
    remainingNumbers: LotteryNumber[],
    drawHistory?: DrawRecord[]
  ): void {
    this.drawnNumbers = [...drawnNumbers];
    this.pool = new Set(remainingNumbers);
    if (drawHistory) {
      this.drawHistory = [...drawHistory];
    }
  }

  /**
   * 重置奖池
   */
  reset(
    minNumber: number = 1,
    maxNumber: number = 300,
    blacklist: LotteryNumber[] = [],
    whitelist: LotteryNumber[] = []
  ): void {
    const allNumbers: LotteryNumber[] = [];
    for (let i = minNumber; i <= maxNumber; i++) {
      allNumbers.push(i);
    }

    let availableNumbers = whitelist.length > 0 
      ? allNumbers.filter(num => whitelist.includes(num))
      : allNumbers;

    availableNumbers = availableNumbers.filter(num => !blacklist.includes(num));

    this.pool = new Set(availableNumbers);
    this.drawnNumbers = [];
    this.drawHistory = [];
  }
}

