import { useMemo } from 'react';
import { Task, DisplayItem } from '../types';

/**
 * タスクリストを表示用の統一リスト形式（グループと独立タスクの混在リスト）に変換するフック
 * @param tasks 全タスクリスト
 * @param useGrouping グルーピングを使用するかどうか
 * @returns 表示用のDisplayItem配列
 */
export const useTaskDisplayList = (tasks: Task[], useGrouping: boolean): DisplayItem[] => {
  return useMemo(() => {
    if (!useGrouping) return [];

    const sortedTasks = [...tasks];
    
    const items: DisplayItem[] = [];
    const processedGroups = new Set<string>();
    
    for (const task of sortedTasks) {
      const parentName = task.parentTaskName;
      
      if (parentName && parentName !== '独立タスク' && task.name !== parentName) {
        // 親タスクグループ
        if (!processedGroups.has(parentName)) {
          processedGroups.add(parentName);
          const groupTasks = tasks.filter(t => t.parentTaskName === parentName && t.name !== parentName);
          items.push({ type: 'group', parentName, tasks: groupTasks });
        }
      } else {
        // 独立タスク（または親タスク自体だが、それは通常表示しないか独立扱い）
        if (task.name === parentName) continue; // 親タスク定義自体はスキップ
        items.push({ type: 'task', task });
      }
    }
    return items;
  }, [tasks, useGrouping]);
};
