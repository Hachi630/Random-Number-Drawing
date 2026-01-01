import { useEffect, useRef } from 'react';
import type { DrawRecord } from '../types';
import './WinnerList.css';

interface WinnerListProps {
  drawHistory: DrawRecord[];
  maxDisplay?: number;
}

/**
 * 中奖名单展示组件
 * 实时滚动显示已抽取的号码
 */
export function WinnerList({ drawHistory, maxDisplay = 50 }: WinnerListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const displayHistory = drawHistory.slice(-maxDisplay).reverse(); // 最新的在前

  // 自动滚动到底部（最新记录）
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [drawHistory.length]);

  if (drawHistory.length === 0) {
    return (
      <div className="winner-list-container">
        <h3 className="winner-list-title">中奖名单</h3>
        <div className="winner-list-empty">
          <p>暂无中奖记录</p>
          <p className="hint">抽奖结果将显示在这里</p>
        </div>
      </div>
    );
  }

  return (
    <div className="winner-list-container">
      <h3 className="winner-list-title">
        中奖名单
        <span className="count-badge">{drawHistory.length}</span>
      </h3>
      <div className="winner-list" ref={listRef}>
        {displayHistory.map((record, index) => (
          <div key={`${record.timestamp}-${index}`} className="winner-item">
            <div className="winner-numbers">
              {record.numbers.map((num, numIndex) => (
                <span key={numIndex} className="winner-number">
                  {num}
                </span>
              ))}
            </div>
            <div className="winner-meta">
              <span className="winner-time">
                {new Date(record.timestamp).toLocaleTimeString('zh-CN')}
              </span>
              {record.prize && (
                <span className="winner-prize">{record.prize}</span>
              )}
            </div>
          </div>
        ))}
        {drawHistory.length > maxDisplay && (
          <div className="winner-list-more">
            还有 {drawHistory.length - maxDisplay} 条记录...
          </div>
        )}
      </div>
    </div>
  );
}

