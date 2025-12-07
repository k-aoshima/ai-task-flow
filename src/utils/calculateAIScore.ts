import { calculateContextRelevance } from './keywordMatching';
import { Task, TabContext, DomainPattern } from '../types';

/**
 * タスクの優先度スコアを計算
 */
export const calculateAIScore = (
  task: Task,
  tabContext: TabContext | null = null,
  domainPatterns: DomainPattern[] = []
): number => {
  const baseScore = task.urgency + task.importance + 1;
  
  // 動的ブースト: タブ情報に基づくキーワードマッチング
  let dynamicBoost = 1.0;
  if (tabContext) {
    const relevanceScore = calculateContextRelevance(task, tabContext, domainPatterns);
    // 関連性スコアが高いほど、大幅にブースト（最大2.5倍）
    dynamicBoost = 1.0 + relevanceScore * 1.5;
  }
  
  return baseScore * dynamicBoost;
};

/**
 * タスクをスコアでソートし、Top 1にisTopPriorityを設定
 */
export const getSortedTasks = (
  tasks: Task[],
  tabContext: TabContext | null = null,
  domainPatterns: DomainPattern[] = []
): Task[] => {
  const activeTasks = tasks.filter((t) => t.status === 'active');
  const sorted = [...activeTasks].sort((a, b) => {
    const scoreA = calculateAIScore(a, tabContext, domainPatterns);
    const scoreB = calculateAIScore(b, tabContext, domainPatterns);
    return scoreB - scoreA;
  });

  // Top 1にisTopPriorityを設定
  return sorted.map((task, index) => ({
    ...task,
    isTopPriority: index === 0,
  }));
};

/**
 * 今すぐ実行リスト（上位3件）を取得
 */
export const getTopTasks = (
  tasks: Task[],
  tabContext: TabContext | null = null,
  domainPatterns: DomainPattern[] = []
): Task[] => {
  return getSortedTasks(tasks, tabContext, domainPatterns).slice(0, 3);
};

