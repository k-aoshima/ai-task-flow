import React from 'react';
import { Task } from '../types';

interface TimeSummaryProps {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
}

export const TimeSummary: React.FC<TimeSummaryProps> = ({ tasks, activeTasks, completedTasks }) => {
  // 合計時間を計算
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
  };

  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const totalActiveTime = activeTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const totalCompletedTime = completedTasks.reduce((sum, task) => sum + task.estimatedTime, 0);

  if (tasks.length === 0) return null;

  return (
    <div className="glass-card p-6 animate-enter">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">時間サマリー</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 全タスク */}
        <div className="relative overflow-hidden group rounded-xl p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">全タスク</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatTime(totalTime)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tasks.length} 件</div>
          </div>
        </div>
        
        {/* 未完了 */}
        <div className="relative overflow-hidden group rounded-xl p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">未完了</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatTime(totalActiveTime)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">残り {activeTasks.length} 件</div>
          </div>
        </div>

        {/* 完了 */}
        <div className="relative overflow-hidden group rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">完了</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatTime(totalCompletedTime)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{completedTasks.length} 件完了</div>
          </div>
        </div>
      </div>
    </div>
  );
};
