import { useState, useEffect, useCallback, useMemo } from 'react';
import { LotteryDisplay } from './components/LotteryDisplay';
import { ControlPanel } from './components/ControlPanel';
import { WinnerList } from './components/WinnerList';
import { ConfettiEffect } from './components/ConfettiEffect';
import { useLotteryPool } from './hooks/useLotteryPool';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardControl } from './hooks/useKeyboardControl';
import { exportToExcel, copyToClipboard } from './utils/excelExporter';
import type { LotteryNumber, PrizeConfig, PrizeId, DrawRecord } from './types';
import './styles/App.css';

const EVENT_TITLE = '西门社区新春联欢会';

const PRIZE_PRESET: Record<PrizeId, { name: string; total: number }> = {
  happiness: { name: '幸福奖', total: 30 },
  third: { name: '三等奖', total: 6 },
  second: { name: '二等奖', total: 4 },
  first: { name: '一等奖', total: 2 },
  special: { name: '特等奖', total: 1 },
};

const createPrizeState = (): PrizeConfig[] =>
  (Object.keys(PRIZE_PRESET) as PrizeId[]).map((id) => ({
    id,
    name: PRIZE_PRESET[id].name,
    total: PRIZE_PRESET[id].total,
    remaining: PRIZE_PRESET[id].total,
  }));

function App() {
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(300);
  const [drawCount, setDrawCount] = useState(1);
  const [currentPrize, setCurrentPrize] = useState<PrizeId>('happiness');
  const [prizeState, setPrizeState] = useState<PrizeConfig[]>(createPrizeState);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [multipleNumbers, setMultipleNumbers] = useState<LotteryNumber[] | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const {
    currentNumber,
    drawnNumbers,
    remainingCount,
    drawMultiple,
    reset,
    restore,
    getRemainingNumbers,
  } = useLotteryPool(minNumber, maxNumber);

  const { saveData, loadData, clearData } = useLocalStorage();

  // 恢复存储数据
  useEffect(() => {
    const stored = loadData();
    if (!stored) {
      return;
    }
    setMinNumber(stored.minNumber ?? 1);
    setMaxNumber(stored.maxNumber ?? 300);
    setDrawHistory(stored.drawHistory ?? []);
    setPrizeState(stored.prizeState ?? createPrizeState());
    setCurrentPrize(stored.currentPrize ?? 'happiness');
    setDrawCount(stored.drawCount ?? 1);
    restore(stored.drawnNumbers ?? [], stored.remainingNumbers ?? []);
  }, [loadData, restore]);

  const totalNumbers = useMemo(() => maxNumber - minNumber + 1, [minNumber, maxNumber]);

  // 保存到本地
  useEffect(() => {
    if (totalNumbers === 0) return;
    saveData(
      drawnNumbers,
      getRemainingNumbers(),
      [],
      [],
      drawHistory,
      minNumber,
      maxNumber,
      prizeState,
      currentPrize,
      drawCount
    );
  }, [
    drawnNumbers,
    drawHistory,
    prizeState,
    minNumber,
    maxNumber,
    currentPrize,
    drawCount,
    getRemainingNumbers,
    saveData,
    totalNumbers,
  ]);

  const displayNumbers =
    multipleNumbers ??
    (drawHistory.length > 0
      ? drawHistory[drawHistory.length - 1].numbers
      : currentNumber !== null
        ? [currentNumber]
        : null);

  const triggerConfetti = () => {
    setConfettiTrigger(true);
    setTimeout(() => setConfettiTrigger(false), 100);
  };

  const handleDraw = useCallback(
    (count: number) => {
      const prize = prizeState.find((p) => p.id === currentPrize);
      if (!prize) {
        alert('请选择奖项');
        return;
      }
      if (prize.remaining <= 0) {
        alert(`${prize.name} 的名额已全部抽完`);
        return;
      }
      const actualCount = Math.min(count, prize.remaining, remainingCount);
      if (actualCount <= 0) {
        alert('奖池已空或奖项名额不足');
        return;
      }
      const numbers = drawMultiple(actualCount);
      if (!numbers.length) {
        alert('没有可用号码');
        return;
      }
      setMultipleNumbers(numbers);
      setDrawHistory((prev) => [
        ...prev,
        { numbers, timestamp: Date.now(), prize: prize.name },
      ]);
      setPrizeState((prev) =>
        prev.map((p) =>
          p.id === currentPrize ? { ...p, remaining: p.remaining - numbers.length } : p
        )
      );
      triggerConfetti();
    },
    [currentPrize, drawMultiple, prizeState, remainingCount]
  );

  const handleStart = useCallback(() => {
    handleDraw(drawCount);
  }, [handleDraw, drawCount]);

  const handleRedrawOne = useCallback(() => {
    handleDraw(1);
  }, [handleDraw]);

  const handleReset = useCallback(() => {
    if (!window.confirm('此操作会清空所有记录并重建奖池，确认吗？')) return;
    reset(minNumber, maxNumber);
    setDrawHistory([]);
    setPrizeState(createPrizeState());
    setMultipleNumbers(null);
    clearData();
  }, [reset, minNumber, maxNumber, clearData]);

  const handleRangeChange = useCallback(
    (newMin: number, newMax: number) => {
      if (newMin >= newMax) {
        alert('起始号码必须小于结束号码');
        return;
      }
      setMinNumber(newMin);
      setMaxNumber(newMax);
      reset(newMin, newMax);
      setDrawHistory([]);
      setPrizeState(createPrizeState());
      setMultipleNumbers(null);
      clearData();
    },
    [reset, clearData]
  );

  const handleExport = useCallback(async () => {
    if (!drawHistory.length) {
      alert('暂无中奖记录可导出');
      return;
    }
    try {
      exportToExcel(drawHistory, '西门社区抽奖获奖名单');
      await copyToClipboard(drawHistory);
      alert('已导出并复制中奖名单');
    } catch (error) {
      console.error(error);
      alert('导出失败，请稍后重试');
    }
  }, [drawHistory]);

  useKeyboardControl({
    onSpace: () => {
      if (remainingCount > 0) {
        handleStart();
      }
    },
  });

  return (
    <div className="app-container">
      <div className="hero-overlay" />
      <div className="content-wrapper">
        <LotteryDisplay
          title={EVENT_TITLE}
          prizeName={PRIZE_PRESET[currentPrize].name}
          numbers={displayNumbers}
        />

        <div className="bottom-panels">
          <ControlPanel
            remainingCount={remainingCount}
            minNumber={minNumber}
            maxNumber={maxNumber}
            drawCount={drawCount}
            onChangeDrawCount={setDrawCount}
            onChangeRange={handleRangeChange}
            prizeState={prizeState}
            currentPrize={currentPrize}
            onChangePrize={setCurrentPrize}
            onStart={handleStart}
            onRedrawOne={handleRedrawOne}
            onReset={handleReset}
            onExport={handleExport}
          />

          <WinnerList drawHistory={drawHistory} />
        </div>
      </div>

      <ConfettiEffect trigger={confettiTrigger} duration={2000} />
    </div>
  );
}

export default App;

