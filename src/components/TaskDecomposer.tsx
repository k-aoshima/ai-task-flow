import React, { useState } from 'react';
import { Task } from '../types';
import { useToast } from './ToastProvider';

interface TaskDecomposerProps {
  apiKey: string;
  onTasksGenerated: (tasks: Task[]) => void;
  onNavigateToSettings: () => void;
}

/**
 * タスク分解コンポーネント
 */
export const TaskDecomposer: React.FC<TaskDecomposerProps> = ({
  apiKey,
  onTasksGenerated,
  onNavigateToSettings,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleDecompose = async () => {
    if (!inputText.trim()) {
      setError('タスクを入力してください');
      return;
    }

    if (!apiKey) {
      onNavigateToSettings();
      return;
    }

    // 入力テキストを改行で分割し、空行を除外
    const lines = inputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setError('タスクを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    // 設定をlocalStorageから直接読み込む
    const preferredModel = localStorage.getItem('aiTaskFlow_preferredModel') || 'gemini-1.5-flash';
    const autoSwitchModels = localStorage.getItem('aiTaskFlow_autoSwitchModels') !== 'false';

    try {
      const { predictTaskProperties } = await import('../utils/predictTaskProperties');
      
      // 各行を個別のタスクとして処理（AIでスコアと環境を予測）
      const taskPromises = lines.map(async (line) => {
        try {
          // オプションを渡して呼び出し
          const properties = await predictTaskProperties(apiKey, line, {
            preferredModel,
            autoSwitch: autoSwitchModels,
            onModelSwitch: (newModel) => {
                showToast(`API制限のため、モデルを ${newModel} に切り替えました`, 'warning', 5000);
            }
          });

          return {
            id: crypto.randomUUID(),
            name: line,
            urgency: properties.urgency,
            importance: properties.importance,
            contextKey: properties.contextKey,
            estimatedTime: properties.estimatedTime,
            keywords: properties.keywords || [],
            status: 'active' as const,
            isTopPriority: false,
          };
        } catch (error) {
          // エラーが発生した場合は、デフォルト値でタスクを作成
          console.error(`タスク "${line}" の予測でエラー:`, error);
          return {
            id: crypto.randomUUID(),
            name: line,
            urgency: 2,
            importance: 3,
            contextKey: 'None',
            estimatedTime: 30,
            keywords: [],
            status: 'active' as const,
            isTopPriority: false,
          };
        }
      });

      // すべてのタスクを並列で処理
      const newTasks = await Promise.all(taskPromises);
      onTasksGenerated(newTasks);
      setInputText('');
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タスク作成に失敗しました';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-enter">
      <div className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            タスクを作成
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="1日で完了するタスクを1行に1つずつ入力してください&#10;&#10;例:&#10;ユーザー認証機能を実装&#10;山田さんにメールを送信する"
            rows={6}
            className="input-field resize-y min-h-[120px] shadow-inner bg-slate-50/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            {inputText.length} 文字
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50/50 dark:bg-rose-900/20 border-l-4 border-rose-400 rounded-r-lg animate-enter">
            <div className="flex items-start text-sm text-rose-700 dark:text-rose-300">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>{error}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleDecompose}
          disabled={isLoading || !apiKey}
          className="btn-primary w-full py-3 text-base font-bold tracking-wide shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>AI処理中...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>タスク作成</span>
            </span>
          )}
        </button>

        {!apiKey && (
          <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-lg">
            <div className="flex items-start text-sm text-amber-800 dark:text-amber-300">
               <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
              <div>
                <div className="font-bold mb-1">準備ができていません</div>
                <p className="text-xs opacity-90">設定画面でGemini APIキーを設定してください</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
