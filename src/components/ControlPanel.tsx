import './ControlPanel.css';

interface ControlPanelProps {
  remainingCount: number;
  onStart: () => void;
  onReset: () => void;
  onExport: () => void;
}

/**
 * 控制面板组件
 * 提供抽奖控制按钮
 */
export function ControlPanel({
  remainingCount,
  onStart,
  onReset,
  onExport,
}: ControlPanelProps) {
  const handleReset = () => {
    if (window.confirm('确定要重置奖池吗？这将清除所有已抽取的记录！')) {
      onReset();
    }
  };

  return (
    <div className="control-panel">
      <div className="control-main">
        <button
          className="btn btn-primary btn-large"
          onClick={onStart}
          disabled={remainingCount === 0}
        >
          {remainingCount === 0 ? '奖池已空' : '开始抽奖'}
        </button>
      </div>

      <div className="control-actions">
        <button
          className="btn btn-export"
          onClick={onExport}
        >
          导出名单
        </button>
        <button
          className="btn btn-danger"
          onClick={handleReset}
        >
          重置奖池
        </button>
      </div>

      <div className="remaining-info">
        剩余号码：<strong>{remainingCount}</strong> 个
      </div>
    </div>
  );
}

