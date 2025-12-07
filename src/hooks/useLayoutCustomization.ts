import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { LayoutConfig } from '../types';

/**
 * デフォルトのレイアウト設定
 */
const DEFAULT_LAYOUT: LayoutConfig = {
  areas: [
    'tabContext',
    'timeSummary',
    'taskDecomposer',
    'completedList',
    'currentTaskList',
    'allTaskList',
  ],
};

/**
 * レイアウトカスタマイズを管理するカスタムフック
 */
export function useLayoutCustomization() {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layoutConfig, setLayoutConfig] = useLocalStorage<LayoutConfig>(
    'aiTaskFlow_layoutConfig',
    DEFAULT_LAYOUT
  );

  /**
   * カスタマイズモードの切り替え
   */
  const toggleCustomizing = () => {
    setIsCustomizing((prev) => !prev);
  };

  /**
   * エリアの順序を変更
   */
  const reorderArea = (fromIndex: number, toIndex: number) => {
    setLayoutConfig((prev) => {
      const newAreas = [...prev.areas];
      const [movedArea] = newAreas.splice(fromIndex, 1);
      newAreas.splice(toIndex, 0, movedArea);
      return { areas: newAreas };
    });
  };

  /**
   * デフォルトレイアウトにリセット
   */
  const resetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT);
  };

  return {
    isCustomizing,
    layoutConfig,
    toggleCustomizing,
    reorderArea,
    resetLayout,
  };
}
