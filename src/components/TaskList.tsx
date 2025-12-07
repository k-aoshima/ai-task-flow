import React, { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { TaskGroup } from './TaskGroup';
import { Task, TabContext, TimerData, DomainPattern } from '../types';
import { useTaskDisplayList } from '../hooks/useTaskDisplayList';

interface TaskListProps {
  tasks: Task[];
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
  onReorder?: (taskId: string, newIndex: number) => void;
  onReorderParentGroup?: (draggedParentName: string, targetParentName: string) => void;
  onReorderBetweenGroupAndTask?: (draggedParentName: string | null, draggedTaskId: string | null, targetParentName: string | null, targetTaskId: string | null) => void;
  onReorderUnified?: (draggedItemId: string, draggedItemType: 'group' | 'task', newIndex: number) => void;
  onToggleCheck?: (taskId: string) => void;
  getRemainingTime?: (taskId: string) => import('../types').RemainingTime;
  onCancelTimer?: (taskId: string) => void;
  title: string;
  showScore?: boolean;
  enableDragAndDrop?: boolean;
  resplittingTaskId?: string | null;
  useGrouping?: boolean;
  allTasks?: Task[];
  suggestedTaskIds?: Set<string>;
  domainPatterns?: DomainPattern[];
}

/**
 * タスクリストコンポーネント
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
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
  onReorder,
  onReorderParentGroup,
  onReorderBetweenGroupAndTask,
  onReorderUnified,
  onToggleCheck,
  getRemainingTime,
  onCancelTimer,
  title,
  showScore = true,
  enableDragAndDrop = false,
  resplittingTaskId = null,
  useGrouping = false,
  allTasks = [],
  suggestedTaskIds = new Set(),
  domainPatterns,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ドラッグしていたタスクがリストから消えた場合（移動した場合）、ドラッグ状態をリセット
  useEffect(() => {
    if (draggedTaskId && !tasks.find(t => t.id === draggedTaskId)) {
      setDraggedTaskId(null);
    }
  }, [draggedTaskId, tasks]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    if (draggedTaskId !== null && dragOverIndex !== null && onReorder) {
      const draggedIndex = tasks.findIndex((t) => t.id === draggedTaskId);
      if (draggedIndex !== -1 && draggedIndex !== dragOverIndex) {
        onReorder(draggedTaskId, dragOverIndex);
      }
    }
    setDraggedTaskId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTaskId && tasks.findIndex((t) => t.id === draggedTaskId) !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTaskId && onReorder) {
      const draggedIndex = tasks.findIndex((t) => t.id === draggedTaskId);
      if (draggedIndex !== -1 && draggedIndex !== index) {
        onReorder(draggedTaskId, index);
      }
    }
    setDragOverIndex(null);
    setDraggedTaskId(null);
  };

  // 合計時間を計算
  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
  };

  // グループの展開/折りたたみ
  const toggleGroup = (parentName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentName)) {
        newSet.delete(parentName);
      } else {
        newSet.add(parentName);
      }
      return newSet;
    });
  };

  // 統合リスト表示用のデータ構造を作成
  const unifiedDisplayList = useTaskDisplayList(tasks, useGrouping || false);

  return (
    <div className="glass-card p-6 animate-enter">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {title === "今すぐ実行リスト（上位3件）" && <span className="text-orange-500">🔥</span>}
            {title}
        </h2>
        {tasks.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            合計: {formatTime(totalTime)}
          </span>
        )}
      </div>
      
      {useGrouping && unifiedDisplayList.length > 0 ? (
        <div className="space-y-3">
          {unifiedDisplayList.map((item, index) => {
            if (item.type === 'task') {
              const task = item.task;
              return (
                <div
                  key={task.id}
                  onDragOver={enableDragAndDrop ? (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (onReorderUnified) {
                      setDragOverIndex(index);
                    } else {
                      // フォールバック: 通常のインデックス（あまり使われない）
                      handleDragOver(e, index);
                    }
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
                    } else if (draggedTaskId && !isDraggedParentGroup && onReorder) {
                      handleDrop(e, index);
                    }
                  } : undefined}
                >
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
                    onDragStart={enableDragAndDrop ? (e) => {
                      handleDragStart(task.id);
                      if (onReorderUnified) {
                        e.dataTransfer.setData('unifiedIndex', index.toString());
                      }
                    } : undefined}
                    onDragEnd={enableDragAndDrop ? handleDragEnd : undefined}
                    isDragging={draggedTaskId === task.id}
                    isDragOver={dragOverIndex === index}
                    showScore={showScore}
                    isResplitting={resplittingTaskId === task.id}
                    allTasks={allTasks}
                    isSuggested={suggestedTaskIds?.has(task.id)}
                    getRemainingTime={getRemainingTime}
                    onCancelTimer={onCancelTimer}
                    domainPatterns={domainPatterns}
                  />
                </div>
              );
            } else {
              // Group
              const { parentName, tasks: groupTasks } = item;
              const isExpanded = expandedGroups.has(parentName);
              
              return (
                <TaskGroup
                  key={parentName}
                  parentName={parentName}
                  tasks={groupTasks}
                  index={index}
                  isExpanded={isExpanded}
                  onToggleExpand={toggleGroup}
                  enableDragAndDrop={enableDragAndDrop}
                  tabContext={tabContext}
                  timersData={timersData}
                  onPause={onPause}
                  onDelete={onDelete}
                  onDeleteTasks={onDeleteTasks}
                  onComplete={onComplete}
                  onCompleteTasks={onCompleteTasks}
                  onUpdateTime={onUpdateTime}
                  onUpdateContext={onUpdateContext}
                  onUpdateName={onUpdateName}
                  onUpdateParentName={onUpdateParentName}
                  onResplit={onResplit}
                  onToggleCheck={onToggleCheck}
                  getRemainingTime={getRemainingTime}
                  onCancelTimer={onCancelTimer}
                  showScore={showScore}
                  resplittingTaskId={resplittingTaskId}
                  allTasks={allTasks}
                  suggestedTaskIds={suggestedTaskIds}
                  onReorderUnified={onReorderUnified}
                  onReorderParentGroup={onReorderParentGroup}
                  onReorderBetweenGroupAndTask={onReorderBetweenGroupAndTask}
                  setDragOverIndex={setDragOverIndex}
                  domainPatterns={domainPatterns}
                />
              );
            }
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div 
              className="text-center text-slate-400 dark:text-slate-500 text-sm py-8 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl bg-slate-50/50 dark:bg-slate-900/20"
              onDragOver={enableDragAndDrop ? (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              } : undefined}
              onDrop={enableDragAndDrop ? (e) => {
                e.preventDefault();
                const draggedTaskId = e.dataTransfer.getData('text/plain');
                const isParentGroup = e.dataTransfer.getData('isParentGroup') === 'true';
                const parentGroupName = e.dataTransfer.getData('parentGroupName');

                if (onReorderUnified) {
                    if (isParentGroup && parentGroupName) {
                         onReorderUnified(parentGroupName, 'group', 0);
                    } else if (draggedTaskId) {
                         onReorderUnified(draggedTaskId, 'task', 0);
                    }
                } else if (draggedTaskId && onReorder) {
                  onReorder(draggedTaskId, 0);
                }
              } : undefined}
            >
              実行するタスクをここにドラッグ
            </div>
          ) : (
            tasks.map((task, index) => (
            <div
              key={task.id}
              onDragOver={enableDragAndDrop ? (e) => handleDragOver(e, index) : undefined}
              onDrop={enableDragAndDrop ? (e) => handleDrop(e, index) : undefined}
            >
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
              onDragStart={enableDragAndDrop ? (_e) => handleDragStart(task.id) : undefined}
              onDragEnd={enableDragAndDrop ? handleDragEnd : undefined}
              isDragging={draggedTaskId === task.id}
              isDragOver={dragOverIndex === index}
              showScore={showScore}
              isResplitting={resplittingTaskId === task.id}
              allTasks={allTasks}
              isSuggested={suggestedTaskIds?.has(task.id)}
              getRemainingTime={getRemainingTime}
              onCancelTimer={onCancelTimer}
              domainPatterns={domainPatterns}
            />
            </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
