import { useMemo } from 'react';
import { Task, TabContext, DomainPattern } from '../types';
import { calculateAIScore } from '../utils/calculateAIScore';

export const useTaskFiltering = (
  tasks: Task[],
  tabContext: TabContext | null,
  domainPatterns: DomainPattern[]
) => {
  // コンテキストに関連するタスクを特定（ハイライト用）
  const suggestedTaskIds = useMemo(() => {
    return new Set(
      tasks
        .filter(t => calculateAIScore(t, tabContext, domainPatterns) > 10)
        .map(t => t.id)
    );
  }, [tasks, tabContext, domainPatterns]);

  // タスクのソートとフィルタリング
  const { activeTasks, completedTasks } = useMemo(() => {
    const active = tasks.filter((t) => t.status === 'active');
    const completed = tasks.filter((t) => t.status === 'completed');
    return { activeTasks: active, completedTasks: completed };
  }, [tasks]);

  // 完了タスクも順序でソート
  const sortedCompletedTasks = useMemo(() => {
    return completedTasks
      .map((task) => ({
        ...task,
        order: task.order ?? Infinity,
      }))
      .sort((a, b) => {
        if (a.order !== Infinity && b.order !== Infinity) {
          return a.order - b.order;
        }
        if (a.order !== Infinity) return -1;
        if (b.order !== Infinity) return 1;
        return 0;
      });
  }, [completedTasks]);

  // 実行中のタスク（isCurrent=true）
  const currentListTasks = useMemo(() => {
    return activeTasks
      .filter(t => t.isCurrent)
      .map((task) => ({ ...task, order: task.order ?? Infinity }))
      .sort((a, b) => (a.order - b.order));
  }, [activeTasks]);

  // メインタスクリスト（isCurrent=false）
  const sortedTasks = useMemo(() => {
    return activeTasks
      .filter(t => !t.isCurrent)
      .map((task) => ({ ...task, order: task.order ?? Infinity }))
      .sort((a, b) => {
        if (a.order !== Infinity && b.order !== Infinity) return a.order - b.order;
        if (a.order !== Infinity) return -1;
        if (b.order !== Infinity) return 1;
        // 順序未設定はAIスコア順（既存ロジック維持）
        const scoreA = calculateAIScore(a, tabContext, domainPatterns);
        const scoreB = calculateAIScore(b, tabContext, domainPatterns);
        return scoreB - scoreA;
      });
  }, [activeTasks, tabContext, domainPatterns]);

  return {
    activeTasks,
    completedTasks,
    sortedCompletedTasks,
    currentListTasks,
    sortedTasks,
    suggestedTaskIds,
  };
};
