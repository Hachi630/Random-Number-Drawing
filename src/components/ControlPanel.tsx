import './ControlPanel.css';
import type { PrizeConfig, PrizeId } from '../types';

interface ControlPanelProps {
  remainingCount: number;
  minNumber: number;
  maxNumber: number;
  drawCount: number;
  onChangeDrawCount: (value: number) => void;
  onChangeRange: (min: number, max: number) => void;
  prizeState: PrizeConfig[];
  currentPrize: PrizeId;
  onChangePrize: (id: PrizeId) => void;
  onStart: () => void;
  onRedrawOne: () => void;
  onReset: () => void;
  onExport: () => void;
}

export function ControlPanel({
  remainingCount,
  minNumber,
  maxNumber,
  drawCount,
  onChangeDrawCount,
  onChangeRange,
  prizeState,
  currentPrize,
  onChangePrize,
  onStart,
  onRedrawOne,
  onReset,
  onExport,
}: ControlPanelProps) {
  const selectedPrize = prizeState.find((p) => p.id === currentPrize);

  const handleReset = () => {
    if (window.confirm('确定要重置奖池吗？这将清除所有已抽取的记录！')) {
      onReset();
    }
  };

  return (
    <div className="control-panel">
      <div className="control-grid">
        <div className="field">
          <label>抽取人数</label>
          <input
            type="number"
            min={1}
            max={remainingCount || 1}
            value={drawCount}
            onChange={(e) => onChangeDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <div className="field range">
          <label>号码范围</label>
          <div className="range-inputs">
            <input
              type="number"
              value={minNumber}
              min={1}
              onChange={(e) =>
                onChangeRange(Math.max(1, parseInt(e.target.value) || 1), maxNumber)
              }
            />
            <span className="range-sep">至</span>
            <input
              type="number"
              value={maxNumber}
              min={minNumber + 1}
              onChange={(e) =>
                onChangeRange(
                  minNumber,
                  Math.max(minNumber + 1, parseInt(e.target.value) || minNumber + 1)
                )
              }
            />
          </div>
        </div>

        <div className="field">
          <label>当前奖项</label>
          <select value={currentPrize} onChange={(e) => onChangePrize(e.target.value as PrizeId)}>
            {prizeState.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（剩余 {p.remaining}/{p.total}）
              </option>
            ))}
          </select>
          {selectedPrize && selectedPrize.remaining === 0 && (
            <p className="hint-text">该奖项已抽完，可切换其他奖项</p>
          )}
        </div>
      </div>

      <div className="prize-list">
        {prizeState.map((prize) => (
          <div
            key={prize.id}
            className={`prize-item ${prize.id === currentPrize ? 'active' : ''}`}
            onClick={() => onChangePrize(prize.id)}
          >
            <div className="prize-item-header">
              <span>{prize.name}</span>
              <span>
                {prize.total - prize.remaining}/{prize.total}
              </span>
            </div>
            <div className="prize-progress">
              <div
                className="prize-progress-bar"
                style={{
                  width: `${((prize.total - prize.remaining) / prize.total) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="control-actions">
        <button
          className="btn btn-primary btn-large"
          onClick={onStart}
          disabled={remainingCount === 0 || (selectedPrize && selectedPrize.remaining === 0)}
        >
          {remainingCount === 0 ? '奖池已空' : '开始抽奖'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onRedrawOne}
          disabled={remainingCount === 0}
        >
          补抽一人
        </button>
        <button className="btn btn-export" onClick={onExport}>
          导出名单
        </button>
        <button className="btn btn-danger" onClick={handleReset}>
          重置奖池
        </button>
      </div>

      <div className="remaining-info">
        剩余号码：<strong>{remainingCount}</strong> 个
      </div>
    </div>
  );
}
