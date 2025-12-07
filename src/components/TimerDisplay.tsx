import React, { useState } from 'react';
import { TimerData, RemainingTime } from '../types';

interface TimerDisplayProps {
  timersData: TimerData[];
  getRemainingTime: (taskId: string) => RemainingTime;
  onCancel: (taskId: string) => void;
  isCustomizing?: boolean;
}

/**
 * タイマー表示コンポーネント（複数タイマー対応・アコーディオン）
 */
export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timersData,
  getRemainingTime,
  onCancel,
  isCustomizing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // カスタマイズモードでない場合は、タイマーがなければ非表示
  if (!isCustomizing && (!timersData || timersData.length === 0)) {
    return null;
  }

  // カスタマイズモード時でタイマーがない場合はプレースホルダーを表示
  if (isCustomizing && (!timersData || timersData.length === 0)) {
    return (
      <div className="glass-card p-8 animate-enter border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3">
          <div className="p-4 rounded-full bg-amber-100/50 dark:bg-amber-900/20">
            <svg className="w-10 h-10 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">⏸️ タイマーエリア</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">保留タスクがある時に表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-enter border border-amber-100 dark:border-amber-900/30">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <svg
              className={`w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              ⏸️ 一時停止中のタスク
            </h2>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              {timersData.length}件
            </span>
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timersData.map((timer) => {
              const remainingTime = getRemainingTime(timer.taskId);
              return (
                <div
                  key={timer.taskId}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Task Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          保留中
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {timer.originalTask.contextKey}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
                        {timer.originalTask.name}
                      </h3>
                    </div>

                    {/* Timer */}
                    <div className="text-center py-2">
                      <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight tabular-nums">
                        {remainingTime.minutes}:{remainingTime.seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">
                        残り時間
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${remainingTime.progress}%` }}
                      />
                    </div>

                    {/* Cancel Button */}
                    <button
                      onClick={() => onCancel(timer.taskId)}
                      className="w-full btn-primary py-2 text-sm font-bold shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      再開する
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

