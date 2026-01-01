import { useState, useEffect, useCallback } from 'react';
import { LotteryDisplay } from './components/LotteryDisplay';
import { ControlPanel } from './components/ControlPanel';
import { WinnerList } from './components/WinnerList';
import { SettingsPanel } from './components/SettingsPanel';
import { ConfettiEffect } from './components/ConfettiEffect';
import { useLotteryPool } from './hooks/useLotteryPool';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardControl } from './hooks/useKeyboardControl';
import { exportToExcel, copyToClipboard } from './utils/excelExporter';
import type { LotteryNumber } from './types';
import './styles/App.css';

function App() {
  const [maxNumber, setMaxNumber] = useState<number>(300);
  const [blacklist, setBlacklist] = useState<LotteryNumber[]>([]);
  const [whitelist, setWhitelist] = useState<LotteryNumber[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [multipleNumbers, setMultipleNumbers] = useState<LotteryNumber[] | null>(null);

  const {
    currentNumber,
    drawnNumbers,
    drawHistory,
    remainingCount,
    draw,
    reset,
    restore,
    updateLists,
    getRemainingNumbers,
  } = useLotteryPool(1, maxNumber, blacklist, whitelist);

  const {
    saveData,
    loadData,
    clearData,
  } = useLocalStorage();

  // 检查并恢复数据
  useEffect(() => {
    const stored = loadData();
    if (stored) {
      if (stored.maxNumber) {
        setMaxNumber(stored.maxNumber);
      }
      if (stored.drawnNumbers.length > 0) {
        setShowRestoreModal(true);
      }
    }
  }, [loadData]);

  // 保存数据到本地存储
  useEffect(() => {
    if (drawnNumbers.length > 0 || remainingCount < maxNumber) {
      saveData(
        drawnNumbers,
        getRemainingNumbers(),
        blacklist,
        whitelist,
        drawHistory,
        maxNumber
      );
    }
  }, [drawnNumbers, remainingCount, blacklist, whitelist, drawHistory, maxNumber, saveData, getRemainingNumbers]);

  // 处理恢复数据
  const handleRestore = useCallback(() => {
    const stored = loadData();
    if (stored) {
      if (stored.maxNumber) {
        setMaxNumber(stored.maxNumber);
      }
      restore(stored.drawnNumbers, stored.remainingNumbers, stored.drawHistory);
      setBlacklist(stored.blacklist || []);
      setWhitelist(stored.whitelist || []);
      setShowRestoreModal(false);
    }
  }, [loadData, restore]);

  // 处理不恢复
  const handleDiscard = useCallback(() => {
    clearData();
    setShowRestoreModal(false);
  }, [clearData]);

  // 开始抽奖（直接抽取，无动画）
  const handleStart = useCallback(() => {
    const number = draw();
    if (number !== null) {
      setMultipleNumbers(null); // 清除多个数字显示
      setConfettiTrigger(true);
      setTimeout(() => setConfettiTrigger(false), 100);
    }
  }, [draw]);

  // 重置奖池
  const handleReset = useCallback(() => {
    reset(1, maxNumber, blacklist, whitelist);
    clearData();
  }, [reset, maxNumber, blacklist, whitelist, clearData]);

  // 导出名单
  const handleExport = useCallback(async () => {
    try {
      if (drawHistory.length > 0) {
        exportToExcel(drawHistory, '年会抽奖中奖名单');
        // 同时复制到剪贴板
        await copyToClipboard(drawHistory);
      } else {
        alert('暂无中奖记录可导出');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  }, [drawHistory]);

  // 更新号码总数
  const handleMaxNumberChange = useCallback((newMaxNumber: number) => {
    if (window.confirm(`更改号码总数将重置奖池，确定要继续吗？\n新的号码范围：1-${newMaxNumber}`)) {
      setMaxNumber(newMaxNumber);
      reset(1, newMaxNumber, blacklist, whitelist);
      clearData();
    }
  }, [reset, blacklist, whitelist, clearData]);

  // 更新黑白名单
  const handleBlacklistChange = useCallback((newBlacklist: LotteryNumber[]) => {
    setBlacklist(newBlacklist);
    updateLists(newBlacklist, whitelist);
  }, [updateLists, whitelist]);

  const handleWhitelistChange = useCallback((newWhitelist: LotteryNumber[]) => {
    setWhitelist(newWhitelist);
    updateLists(blacklist, newWhitelist);
  }, [updateLists, blacklist]);

  // 键盘控制
  useKeyboardControl({
    onSpace: () => {
      if (remainingCount > 0) {
        handleStart();
      }
    },
    onEscape: () => {
      if (showSettings) {
        setShowSettings(false);
      }
      if (showRestoreModal) {
        setShowRestoreModal(false);
      }
    },
    enabled: !showRestoreModal,
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🎉 年会抽奖系统 🎉</h1>
        <p className="app-subtitle">幸运大转盘，好运连连来</p>
      </header>

      <main className="main-content">
        <section className="display-section">
          <LotteryDisplay
            currentNumber={currentNumber}
            multipleNumbers={multipleNumbers || undefined}
          />
        </section>

        <section className="winner-section">
          <WinnerList drawHistory={drawHistory} />
        </section>

        <section className="controls-section">
          <ControlPanel
            remainingCount={remainingCount}
            onStart={handleStart}
            onReset={handleReset}
            onExport={handleExport}
          />
        </section>
      </main>

      <button
        className="settings-button"
        onClick={() => setShowSettings(true)}
        title="设置"
      >
        ⚙️
      </button>

      {showSettings && (
        <SettingsPanel
          maxNumber={maxNumber}
          blacklist={blacklist}
          whitelist={whitelist}
          onMaxNumberChange={handleMaxNumberChange}
          onBlacklistChange={handleBlacklistChange}
          onWhitelistChange={handleWhitelistChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showRestoreModal && (
        <div className="restore-modal">
          <div className="restore-modal-content">
            <h2>检测到未完成的抽奖</h2>
            <p>发现之前保存的抽奖数据，是否恢复？</p>
            <div className="restore-info">
              {(() => {
                const stored = loadData();
                return stored ? (
                  <>
                    已抽取：{stored.drawnNumbers.length} 个<br />
                    剩余：{stored.remainingNumbers.length} 个
                  </>
                ) : null;
              })()}
            </div>
            <div className="restore-buttons">
              <button
                className="restore-btn restore-btn-primary"
                onClick={handleRestore}
              >
                恢复数据
              </button>
              <button
                className="restore-btn restore-btn-secondary"
                onClick={handleDiscard}
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfettiEffect trigger={confettiTrigger} duration={2000} />
    </div>
  );
}

export default App;

