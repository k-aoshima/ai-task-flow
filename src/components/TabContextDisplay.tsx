import React from 'react';
import { TabContext } from '../types';

interface TabContextDisplayProps {
  tabContext: TabContext;
}

/**
 * 現在のタブコンテキストを表示するコンポーネント
 */
export const TabContextDisplay: React.FC<TabContextDisplayProps> = ({ tabContext }) => {
  if (!tabContext || !tabContext.title) {
    return null;
  }

  return (
    <div className="glass-card p-4 animate-enter flex items-center gap-4 border-l-4 border-l-blue-500 bg-white/60 dark:bg-slate-800/60">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">現在のタブ</div>
        <div className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm">{tabContext.title}</div>
        {tabContext.domain && (
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{tabContext.domain}</div>
        )}
      </div>
    </div>
  );
};

