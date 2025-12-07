import React, { useState } from 'react';
import { calculateAIScore } from '../utils/calculateAIScore';
import { Task, TabContext, TimerData, RemainingTime, DomainPattern } from '../types';
import { CONTEXT_OPTIONS } from '../constants/contextKeys';

interface TaskCardProps {
  task: Task;
  tabContext: TabContext | null;
  timerData: TimerData | null;
  onPause: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onUpdateTime: (taskId: string, time: number) => void;
  onUpdateContext?: (taskId: string, contextKey: string) => void;
  onUpdateName?: (taskId: string, newName: string) => void;
  onResplit?: (task: Task) => void;
  onToggleCheck?: (taskId: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  showScore?: boolean;
  isResplitting?: boolean;
  allTasks?: Task[];
  isSuggested?: boolean;
  getRemainingTime?: (taskId: string) => RemainingTime;
  onCancelTimer?: (taskId: string) => void;
  domainPatterns?: DomainPattern[];
}

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  bgClass: string;
  hoverClass: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
  colorClass,
  bgClass,
  hoverClass,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg text-slate-400 dark:text-slate-500 transition-all duration-150 relative group/btn ${
      disabled ? 'opacity-50 cursor-not-allowed' : hoverClass
    }`}
  >
    {/* Tooltip */}
    <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-150 pointer-events-none ${bgClass} ${colorClass}`}>
      {label}
    </div>
    {icon}
  </button>
);

/**
 * タスクカードコンポーネント
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  tabContext,
  timerData,
  onPause,
  onDelete,
  onComplete,
  onUpdateTime,
  onUpdateContext,
  onUpdateName,
  onResplit,
  onToggleCheck,
  onDragStart,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
  showScore = true,
  isResplitting = false,
  isSuggested = false,
  getRemainingTime,
  onCancelTimer,
  domainPatterns = [],
}) => {
  const score = calculateAIScore(task, tabContext);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(task.estimatedTime.toString());
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [contextValue, setContextValue] = useState(task.contextKey || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(task.name);
  
  // コンテキストに基づく推奨がある場合のスタイル
  const suggestionStyle = isSuggested 
    ? "ring-2 ring-emerald-400 dark:ring-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)] dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10 relative" 
    : "";

  // コンテキストオプションを結合
  const contextOptions = [
    ...CONTEXT_OPTIONS,
    ...domainPatterns.map(p => ({ value: p.name, label: p.name }))
  ];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    // ドラッグ中は半透明に
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
    // onDragStartを呼び出してunifiedIndexを設定
    if (onDragStart) {
      // unifiedIndexはTaskListから渡されるが、ここでは取得できないため、
      // TaskListでe.dataTransferに設定する必要がある
      onDragStart(e);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTimeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTime(true);
    setTimeValue(task.estimatedTime.toString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTimeValue(value);
    }
  };

  const handleTimeBlur = () => {
    const time = parseInt(timeValue) || task.estimatedTime;
    const validTime = Math.max(1, Math.min(999, time)); // 1-999分の範囲
    onUpdateTime(task.id, validTime);
    setIsEditingTime(false);
    setTimeValue(validTime.toString());
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTime(false);
      setTimeValue(task.estimatedTime.toString());
    }
  };

  const handleContextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateContext) {
      setIsEditingContext(true);
      setContextValue(task.contextKey);
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setContextValue(value);
    if (onUpdateContext) {
      onUpdateContext(task.id, value);
    }
    setIsEditingContext(false);
  };

  const handleContextBlur = () => {
    setIsEditingContext(false);
    setContextValue(task.contextKey);
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 親タスクの場合は名前変更不可にするか、あるいは許可するか。
    // 要求は「既存のタスク名を自由に変更」なので、基本的には許可する方向で。
    if (onUpdateName) {
      setIsEditingName(true);
      setNameValue(task.name);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
  };

  const handleNameBlur = () => {
    if (nameValue.trim() && nameValue !== task.name && onUpdateName) {
      onUpdateName(task.id, nameValue.trim());
    } else {
      setNameValue(task.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setNameValue(task.name);
    }
  };

  // タイマー中かどうかをチェック
  const hasActiveTimer = !!timerData && timerData.taskId === task.id;

  return (
    <div className="relative group">
      {/* タスクカード */}
      <div
        className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl relative transition-all duration-150 ${
          hasActiveTimer 
            ? 'ring-2 ring-amber-400 dark:ring-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.5)] dark:shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20'
            : task.isTopPriority 
              ? 'ring-2 ring-red-400/50 dark:ring-red-500/50 shadow-red-100 dark:shadow-none' 
              : 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
        } ${isDragging ? 'opacity-50 scale-95' : ''} ${
          isDragOver ? 'ring-2 ring-blue-500 scale-[1.02]' : ''
        } ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''} ${
          task.status === 'completed' ? 'opacity-60 bg-slate-50 dark:bg-slate-900' : ''
        } ${suggestionStyle}`}
        draggable={!!onDragStart}
        onDragStart={onDragStart ? handleDragStart : undefined}
        onDragEnd={onDragEnd ? handleDragEnd : undefined}
        onDragOver={onDragStart ? handleDragOver : undefined}
      >
        <div className="flex items-start gap-4">
          {/* Checkbox for Child Tasks */}
           {task.parentTaskName && task.name !== task.parentTaskName && onToggleCheck && (
              <div className="pt-1">
                <input
                    type="checkbox"
                    checked={task.isChecked || false}
                    onChange={() => onToggleCheck(task.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer transition-colors"
                />
              </div>
            )}
          
          <div className="flex-1 min-w-0 space-y-2">
            <div>
                 {hasActiveTimer && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 mb-1.5 mr-1.5 border border-amber-200 dark:border-amber-500/30">
                        ⏸️ 保留中
                    </span>
                 )}
                 {isSuggested && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 mb-1.5 mr-1.5 border border-emerald-200 dark:border-emerald-500/30">
                        ✨ AIおすすめ
                    </span>
                 )}
                 {task.isTopPriority && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 mb-1.5 border border-rose-200 dark:border-rose-500/30">
                        Top Priority
                    </span>
                 )}
                 {task.parentTaskName && (
                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-0.5 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                         {task.parentTaskName}
                    </div>
                  )}
                 {isEditingName ? (
                    <input
                      type="text"
                      value={nameValue}
                      onChange={handleNameChange}
                      onBlur={handleNameBlur}
                      onKeyDown={handleNameKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-base font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-blue-500 rounded px-1 py-0.5 focus:outline-none"
                      autoFocus
                    />
                 ) : (
                   <h3 
                    className={`text-base font-semibold text-slate-800 dark:text-slate-100 break-words leading-snug ${
                      task.isChecked && task.parentTaskName && task.name !== task.parentTaskName ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    } ${onUpdateName ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors' : ''}`}
                    onClick={handleNameClick}
                    title="クリックして名前を編集"
                   >
                     {task.name}
                   </h3>
                 )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
               {/* Urgency/Importance Tags */}
               <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
                   <span className="font-medium">!</span>
                   <span>{task.urgency}/4</span>
               </div>
               <div className="flex items-center gap-1 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-md text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50">
                   <span className="font-medium">★</span>
                   <span>{task.importance}/5</span>
               </div>

              {/* Context Editor */}
              {isEditingContext && onUpdateContext ? (
                  <select
                    value={contextValue}
                    onChange={handleContextChange}
                    onBlur={handleContextBlur}
                    className="px-2 py-1 border border-blue-400 dark:border-blue-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  >
                    {contextOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
              ) : (
                <span
                  onClick={handleContextClick}
                  className={`px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 ${onUpdateContext ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors' : ''}`}
                  title={onUpdateContext ? "環境を編集" : undefined}
                >
                  <span className="opacity-70">📍</span>
                  {task.contextKey}
                </span>
              )}

              {/* Time Editor */}
              {isEditingTime ? (
                  <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={timeValue}
                        onChange={handleTimeChange}
                        onBlur={handleTimeBlur}
                        onKeyDown={handleTimeKeyDown}
                        className="w-12 px-1 py-0.5 border border-blue-500 rounded text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                    <span>min</span>
                  </div>
              ) : (
                <span
                  onClick={handleTimeClick}
                  className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  title="時間を編集"
                >
                  <span className="opacity-70">⏱</span>
                  {task.estimatedTime} min
                </span>
              )}
             </div>
              
              {showScore && (
                <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                    AI Score: {score.toFixed(1)}
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
             {task.parentTaskName && task.name !== task.parentTaskName ? (
              <>
              {task.status !== 'completed' && (
                  <ActionButton
                      onClick={() => onPause(task)}
                      disabled={!!timerData && timerData.taskId === task.id}
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      label="保留タイマー"
                      colorClass="text-amber-500"
                      bgClass="bg-amber-50 dark:bg-amber-900/20"
                      hoverClass="hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  />
              )}
              <ActionButton
                onClick={() => onDelete(task.id)}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                label="削除"
                colorClass="text-rose-500"
                bgClass="bg-rose-50 dark:bg-rose-900/20"
                hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              />
              </>
            ) : (
                <>
                {task.status !== 'completed' && (
                  <ActionButton
                    onClick={() => onComplete(task.id)}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    label="完了"
                    colorClass="text-emerald-500"
                    bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                    hoverClass="hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  />
                )}
                {onResplit && task.status !== 'completed' && (
                  <ActionButton
                    onClick={() => onResplit(task)}
                    disabled={isResplitting}
                    icon={isResplitting ? (
                         <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    )}
                    label="AIタスク分解"
                    colorClass="text-violet-500"
                    bgClass="bg-violet-50 dark:bg-violet-900/20"
                    hoverClass="hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                  />
                )}
                {task.status !== 'completed' && (
                    <ActionButton
                        onClick={() => onPause(task)}
                        disabled={!!timerData && timerData.taskId === task.id}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        label="保留タイマー"
                        colorClass="text-amber-500"
                        bgClass="bg-amber-50 dark:bg-amber-900/20"
                        hoverClass="hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    />
                )}
                <ActionButton
                    onClick={() => onDelete(task.id)}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    label="削除"
                    colorClass="text-rose-500"
                    bgClass="bg-rose-50 dark:bg-rose-900/20"
                    hoverClass="hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                />
                </>
             )}
          </div>
        </div>

        {/* Timer Display Section - Shown when task has active timer */}
        {hasActiveTimer && timerData && getRemainingTime && onCancelTimer && (
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
            <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    保留タイマー実行中
                  </span>
                </div>
              </div>
              
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight tabular-nums">
                  {(() => {
                    const remaining = getRemainingTime(task.id);
                    return `${remaining.minutes}:${remaining.seconds.toString().padStart(2, '0')}`;
                  })()}
                </div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">
                  残り時間
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${getRemainingTime(task.id).progress}%` }}
                />
              </div>

              {/* Cancel/Resume Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelTimer(task.id);
                }}
                className="w-full btn-primary py-2 text-sm font-bold shadow-blue-500/20 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                再開する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
