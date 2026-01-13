// 抽奖号码类型
export type LotteryNumber = number;

// 奖项 ID
export type PrizeId = 'happiness' | 'third' | 'second' | 'first' | 'special';

// 奖项配置
export type PrizeConfig = {
  id: PrizeId;
  name: string;
  total: number;
  remaining: number;
};

// 抽奖记录
export type DrawRecord = {
  numbers: LotteryNumber[];
  timestamp: number;
  prize?: string;
};

// 存储的数据结构
export type StoredData = {
  minNumber: number;
  maxNumber: number;
  drawnNumbers: LotteryNumber[];
  remainingNumbers: LotteryNumber[];
  blacklist: LotteryNumber[];
  whitelist: LotteryNumber[];
  drawHistory: DrawRecord[];
  prizeState: PrizeConfig[];
  currentPrize?: PrizeId;
  drawCount?: number;
  timestamp: number;
};

