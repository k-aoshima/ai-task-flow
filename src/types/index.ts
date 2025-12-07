/**
 * タスクオブジェクトの型定義
 */
export interface Task {
  id: string;
  name: string;
  urgency: number;
  importance: number;
  contextKey: string;
  estimatedTime: number;
  status: 'active' | 'completed' | 'paused';
  isTopPriority: boolean;
  keywords?: string[];
  order?: number; // ドラッグアンドドロップ用の順序
  parentTaskName?: string; // 親タスク名（子タスクの場合のみ）
  isChecked?: boolean; // チェック状態（親タスクがある子タスクのみ）
  isCurrent?: boolean; // 今実行中のタスクかどうか
}

/**
 * タブコンテキストの型定義
 */
export interface TabContext {
  url: string;
  title: string;
  domain: string;
}

/**
 * タイマーデータの型定義
 */
export interface TimerData {
  taskId: string;
  endTime: number;
  duration: number;
  originalTask: Task;
  hasExpired?: boolean;
}

/**
 * ドメインパターンの型定義
 */
export interface DomainPattern {
  id: string;
  name: string;
  patterns: string[];
  keywords: string[];
}

/**
 * Gemini APIレスポンスの型定義
 */
export interface GeminiResponse {
  parentTaskName: string;
  subTasks: Array<{
    name: string;
    urgency: number;
    importance: number;
    contextKey: string;
    estimatedTime: number;
    keywords?: string[];
  }>;
}

/**
 * 残り時間の型定義
 */
export interface RemainingTime {
  minutes: number;
  seconds: number;
  progress: number;
}

/**
 * リスト表示用のアイテム型定義
 */
export type DisplayItem = 
  | { type: 'group'; parentName: string; tasks: Task[] }
  | { type: 'task'; task: Task };

/**
 * レイアウトエリアの種類
 */
export type LayoutAreaType = 
  | 'tabContext'
  | 'timeSummary'
  | 'taskDecomposer'
  | 'completedList'
  | 'currentTaskList'
  | 'allTaskList';

/**
 * レイアウト設定
 */
export interface LayoutConfig {
  areas: LayoutAreaType[];
}

