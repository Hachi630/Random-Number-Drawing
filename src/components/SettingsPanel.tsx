import { useState, useEffect } from 'react';
import type { LotteryNumber } from '../types';
import './SettingsPanel.css';

interface SettingsPanelProps {
  maxNumber: number;
  blacklist: LotteryNumber[];
  whitelist: LotteryNumber[];
  onMaxNumberChange: (maxNumber: number) => void;
  onBlacklistChange: (blacklist: LotteryNumber[]) => void;
  onWhitelistChange: (whitelist: LotteryNumber[]) => void;
  onClose: () => void;
}

/**
 * 设置面板组件
 * 配置黑白名单和其他设置
 */
export function SettingsPanel({
  maxNumber,
  blacklist,
  whitelist,
  onMaxNumberChange,
  onBlacklistChange,
  onWhitelistChange,
  onClose,
}: SettingsPanelProps) {
  const [maxNumberInput, setMaxNumberInput] = useState(maxNumber.toString());
  const [blacklistInput, setBlacklistInput] = useState('');
  const [whitelistInput, setWhitelistInput] = useState('');

  useEffect(() => {
    setMaxNumberInput(maxNumber.toString());
  }, [maxNumber]);

  useEffect(() => {
    setBlacklistInput(formatNumberList(blacklist));
    setWhitelistInput(formatNumberList(whitelist));
  }, [blacklist, whitelist]);

  // 格式化号码列表为字符串（支持范围，如 "1-10,88,100-105"）
  const formatNumberList = (numbers: LotteryNumber[]): string => {
    if (numbers.length === 0) return '';
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        if (start === end) {
          ranges.push(start.toString());
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = sorted[i];
        end = sorted[i];
      }
    }
    
    if (start === end) {
      ranges.push(start.toString());
    } else {
      ranges.push(`${start}-${end}`);
    }

    return ranges.join(', ');
  };

  // 解析输入字符串为号码数组
  const parseNumberList = (input: string): LotteryNumber[] => {
    const numbers = new Set<LotteryNumber>();
    const parts = input.split(',').map(s => s.trim()).filter(s => s);

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= end; i++) {
                if (i >= 1 && i <= 300) {
                  numbers.add(i);
                }
              }
            }
          } else {
            const num = parseInt(part);
            if (!isNaN(num) && num >= 1 && num <= 300) {
              numbers.add(num);
            }
          }
        }

    return Array.from(numbers).sort((a, b) => a - b);
  };

  const handleBlacklistApply = () => {
    const parsed = parseNumberList(blacklistInput);
    onBlacklistChange(parsed);
  };

  const handleWhitelistApply = () => {
    const parsed = parseNumberList(whitelistInput);
    onWhitelistChange(parsed);
  };

  const handleClearBlacklist = () => {
    setBlacklistInput('');
    onBlacklistChange([]);
  };

  const handleClearWhitelist = () => {
    setWhitelistInput('');
    onWhitelistChange([]);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>
              <h3>号码总数</h3>
              <p className="setting-hint">
                设置抽奖号码的范围（从 1 到指定数字）<br />
                例如：输入 300 表示号码范围为 1-300
              </p>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={maxNumberInput}
                  onChange={(e) => setMaxNumberInput(e.target.value)}
                  placeholder="例如：300"
                  className="number-input"
                />
                <div className="button-group">
                  <button
                    className="btn btn-apply"
                    onClick={() => {
                      const num = parseInt(maxNumberInput);
                      if (!isNaN(num) && num >= 1 && num <= 10000) {
                        onMaxNumberChange(num);
                      } else {
                        alert('请输入 1-10000 之间的有效数字');
                        setMaxNumberInput(maxNumber.toString());
                      }
                    }}
                  >
                    应用
                  </button>
                </div>
              </div>
              <div className="list-preview">
                当前范围：1 - {maxNumber}（共 {maxNumber} 个号码）
              </div>
            </label>
          </div>

          <div className="setting-group">
            <label>
              <h3>黑名单（排除号码）</h3>
              <p className="setting-hint">
                输入要排除的号码，支持单个号码或范围，用逗号分隔<br />
                例如：1-10, 88, 100-105
              </p>
              <div className="input-group">
                <input
                  type="text"
                  value={blacklistInput}
                  onChange={(e) => setBlacklistInput(e.target.value)}
                  placeholder="例如：1-10, 88, 100-105"
                  className="number-input"
                />
                <div className="button-group">
                  <button className="btn btn-apply" onClick={handleBlacklistApply}>
                    应用
                  </button>
                  <button className="btn btn-clear" onClick={handleClearBlacklist}>
                    清空
                  </button>
                </div>
              </div>
              {blacklist.length > 0 && (
                <div className="list-preview">
                  已排除：{blacklist.join(', ')} ({blacklist.length} 个)
                </div>
              )}
            </label>
          </div>

          <div className="setting-group">
            <label>
              <h3>白名单（仅使用这些号码）</h3>
              <p className="setting-hint">
                如果设置了白名单，将只从白名单中抽取号码<br />
                留空表示使用全部号码（除黑名单外）
              </p>
              <div className="input-group">
                <input
                  type="text"
                  value={whitelistInput}
                  onChange={(e) => setWhitelistInput(e.target.value)}
                  placeholder="例如：1-50, 100-150"
                  className="number-input"
                />
                <div className="button-group">
                  <button className="btn btn-apply" onClick={handleWhitelistApply}>
                    应用
                  </button>
                  <button className="btn btn-clear" onClick={handleClearWhitelist}>
                    清空
                  </button>
                </div>
              </div>
              {whitelist.length > 0 && (
                <div className="list-preview">
                  仅使用：{whitelist.join(', ')} ({whitelist.length} 个)
                </div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

