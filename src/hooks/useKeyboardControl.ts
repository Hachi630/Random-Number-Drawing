import { useEffect, useCallback } from 'react';

type KeyboardHandler = {
  onSpace?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
};

/**
 * 键盘控制 Hook
 * 支持空格键、Enter键、Escape键的控制
 */
export function useKeyboardControl(handlers: KeyboardHandler) {
  const {
    onSpace,
    onEnter,
    onEscape,
    enabled = true,
  } = handlers;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 防止在输入框中触发
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        onSpace?.();
        break;
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [enabled, onSpace, onEnter, onEscape]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);
}

