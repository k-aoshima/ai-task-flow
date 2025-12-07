import React, { useState } from 'react';
import { Task, TabContext, TimerData } from '../types';
import { TaskCard } from './TaskCard';

interface TaskGroupProps {
  parentName: string;
  tasks: Task[];
  index: number;
  isExpanded: boolean;
  onToggleExpand: (parentName: string) => void;
  enableDragAndDrop: boolean;
  tabContext: TabContext | null;
  timersData: TimerData[];
  onPause: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDeleteTasks?: (taskIds: string[]) => void;
  onComplete: (taskId: string) => void;
  onCompleteTasks?: (taskIds: string[]) => void;
  onUpdateTime: (taskId: string, time: number) => void;
  onUpdateContext?: (taskId: string, contextKey: string) => void;
  onUpdateName?: (taskId: string, newName: string) => void;
  onUpdateParentName?: (oldParentName: string, newParentName: string) => void;
  onResplit?: (task: Task) => void;
  onToggleCheck?: (taskId: string) => void;
  getRemainingTime?: (taskId: string) => import('../types').RemainingTime;
  onCancelTimer?: (taskId: string) => void;
  showScore?: boolean;
  resplittingTaskId?: string | null;
  allTasks?: Task[];
  suggestedTaskIds?: Set<string>;
  
  // Drag and Drop props
  onReorderUnified?: (draggedItemId: string, draggedItemType: 'group' | 'task', newIndex: number) => void;
  onReorderParentGroup?: (draggedParentName: string, targetParentName: string) => void;
  onReorderBetweenGroupAndTask?: (draggedParentName: string | null, draggedTaskId: string | null, targetParentName: string | null, targetTaskId: string | null) => void;
  setDragOverIndex: (index: number | null) => void;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({
  parentName,
  tasks: groupTasks,
  index,
  isExpanded,
  onToggleExpand,
  enableDragAndDrop,
  tabContext,
  timersData,
  onPause,
  onDelete,
  onDeleteTasks,
  onComplete,
  onCompleteTasks,
  onUpdateTime,
  onUpdateContext,
  onUpdateName,
  onUpdateParentName,
  onResplit,
  onToggleCheck,
  getRemainingTime,
  onCancelTimer,
  showScore,
  resplittingTaskId,
  allTasks,
  suggestedTaskIds = new Set(),
  onReorderUnified,
  onReorderParentGroup,
  onReorderBetweenGroupAndTask,
  setDragOverIndex
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [parentNameValue, setParentNameValue] = useState(parentName);

  const sortedGroupTasks = [...groupTasks].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  const groupTotalTime = sortedGroupTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const allCompleted = sortedGroupTasks.every((t) => t.status === 'completed');
  const allChecked = sortedGroupTasks.length > 0 && sortedGroupTasks.every((t) => t.isChecked);
  const hasSuggestedTask = groupTasks.some(t => suggestedTaskIds.has(t.id));

  // 親タスク名の編集ハンドラ
  const handleParentNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateParentName) {
      setIsEditing(true);
      setParentNameValue(parentName);
    }
  };

  const handleParentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParentNameValue(e.target.value);
  };

  const handleParentNameBlur = () => {
    if (parentNameValue.trim() && parentNameValue !== parentName && onUpdateParentName) {
      onUpdateParentName(parentName, parentNameValue.trim());
    } else {
      setParentNameValue(parentName);
    }
    setIsEditing(false);
  };

  const handleParentNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleParentNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setParentNameValue(parentName);
    }
  };

  return (
    <div 
      className={`group/container border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 ${
        hasSuggestedTask ? "ring-2 ring-emerald-400 dark:ring-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)] dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10 relative" : ""
      }`}
      draggable={enableDragAndDrop}
      onDragStart={enableDragAndDrop ? (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('parentGroupName', parentName);
        e.dataTransfer.setData('isParentGroup', 'true');
        e.dataTransfer.setData('allCompleted', allCompleted.toString());
        e.dataTransfer.setData('allChecked', allChecked.toString());
        e.dataTransfer.setData('unifiedIndex', index.toString());
      } : undefined}
      onDragOver={enableDragAndDrop ? (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (onReorderUnified) {
          setDragOverIndex(index);
        }
      } : undefined}
      onDragLeave={enableDragAndDrop ? () => {
        setDragOverIndex(null);
      } : undefined}
      onDrop={enableDragAndDrop ? (e) => {
        e.preventDefault();
        setDragOverIndex(null);
        const draggedParentName = e.dataTransfer.getData('parentGroupName');
        const draggedTaskId = e.dataTransfer.getData('text/plain');
        const isDraggedParentGroup = e.dataTransfer.getData('isParentGroup') === 'true';
        
        if (onReorderUnified) {
          if (isDraggedParentGroup && draggedParentName) {
            onReorderUnified(draggedParentName, 'group', index);
          } else if (draggedTaskId && !isDraggedParentGroup) {
            onReorderUnified(draggedTaskId, 'task', index);
          }
        } else if (isDraggedParentGroup && draggedParentName && draggedParentName !== parentName && onReorderParentGroup) {
          onReorderParentGroup(draggedParentName, parentName);
        } else if (draggedTaskId && !isDraggedParentGroup && onReorderBetweenGroupAndTask) {
          onReorderBetweenGroupAndTask(null, draggedTaskId, parentName, null);
        }
      } : undefined}
    >
      {/* 親タスクヘッダー */}
      <div 
        className={`p-3 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
      >
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 flex-1 min-w-0"
            onClick={() => onToggleExpand(parentName)}
          >
             <div className="p-1 rounded-md bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600">
                <svg 
                  className={`w-3 h-3 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={parentNameValue}
                  onChange={handleParentNameChange}
                  onBlur={handleParentNameBlur}
                  onKeyDown={handleParentNameKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-blue-500 rounded px-2 py-1 focus:outline-none"
                  autoFocus
                />
              ) : (
                <span 
                  className={`font-semibold text-slate-700 dark:text-slate-200 block truncate leading-tight ${
                    onUpdateParentName ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors' : ''
                  }`}
                  onClick={handleParentNameClick}
                  title={onUpdateParentName ? "クリックして親タスク名を編集" : undefined}
                >
                  {parentName}
                </span>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-500">
                  Total: {(groupTotalTime < 60) ? `${groupTotalTime}分` : `${Math.floor(groupTotalTime / 60)}時間${groupTotalTime % 60}分`}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    allChecked 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {sortedGroupTasks.filter(t => t.isChecked).length}/{sortedGroupTasks.length} Checked
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 完了ボタン（すべてチェックされるまで非活性） */}
            {(() => {
              const checkedCount = sortedGroupTasks.filter(t => t.isChecked).length;
              const totalCount = sortedGroupTasks.length;
              const allChecked = checkedCount === totalCount && totalCount > 0;
              
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!allChecked) return;
                    
                    const taskIds = sortedGroupTasks.map(t => t.id);
                    if (onCompleteTasks) {
                      onCompleteTasks(taskIds);
                    } else {
                      sortedGroupTasks.forEach((task) => {
                        onComplete(task.id);
                      });
                    }
                  }}
                  disabled={!allChecked}
                  className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent"
                  title={allChecked ? "完了" : "すべてチェックしてください"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              );
            })()}
            {/* 削除ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const taskIds = sortedGroupTasks.map(t => t.id);
                if (onDeleteTasks) {
                  onDeleteTasks(taskIds);
                } else {
                  sortedGroupTasks.forEach((task) => {
                    onDelete(task.id);
                  });
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              title="削除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 子タスク一覧 */}
      {isExpanded && (
        <div className="p-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50">
          <div className="space-y-2 pl-3 border-l-2 border-slate-200 dark:border-slate-700 ml-1">
            {sortedGroupTasks.map((task) => (
              <div key={task.id}>
                <TaskCard
                  task={task}
                  tabContext={tabContext}
                  timerData={timersData.find(t => t.taskId === task.id) || null}
                  onPause={onPause}
                  onDelete={onDelete}
                  onComplete={onComplete}
                  onUpdateTime={onUpdateTime}
                  onUpdateContext={onUpdateContext}
                  onUpdateName={onUpdateName}
                  onResplit={onResplit}
                  onToggleCheck={onToggleCheck}
                  showScore={showScore}
                  isResplitting={resplittingTaskId === task.id}
                  allTasks={allTasks}
                  isSuggested={suggestedTaskIds?.has(task.id)}
                  getRemainingTime={getRemainingTime}
                  onCancelTimer={onCancelTimer}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
