// 抽奖号码类型
export type LotteryNumber = number;

// 抽奖模式
export type DrawMode = 'single' | 'multiple';

// 抽奖状态
export type LotteryState = {
  pool: Set<LotteryNumber>;
  drawnNumbers: LotteryNumber[];
  blacklist: LotteryNumber[];
  whitelist: LotteryNumber[];
  drawHistory: DrawRecord[];
};

// 抽奖记录
export type DrawRecord = {
  numbers: LotteryNumber[];
  timestamp: number;
  prize?: string;
};

// 抽奖配置
export type LotteryConfig = {
  minNumber: number;
  maxNumber: number;
  blacklist: LotteryNumber[];
  whitelist: LotteryNumber[];
  drawMode: DrawMode;
  animationDuration: number;
};

// 存储的数据结构
export type StoredData = {
  drawnNumbers: LotteryNumber[];
  remainingNumbers: LotteryNumber[];
  blacklist: LotteryNumber[];
  whitelist: LotteryNumber[];
  drawHistory: DrawRecord[];
  maxNumber?: number;
  timestamp: number;
};

