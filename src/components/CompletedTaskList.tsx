import React from 'react';
import { Task, TabContext, TimerData, DomainPattern } from '../types';
import { TaskCard } from './TaskCard';

interface CompletedTaskListProps {
  tasks: Task[]; // All tasks
  sortedCompletedTasks: Task[];
  tabContext: TabContext | null;
  timersData: TimerData[];
  onDeleteTasks: (taskIds: string[]) => void;
  onCompleteTasks: (taskIds: string[]) => void;
  onMoveToCompleted: (taskId: string) => void;
  onReorder: (taskId: string, index: number, list: Task[]) => void;
  onPause: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onUpdateTime: (taskId: string, time: number) => void;
  onUpdateContext: (taskId: string, contextKey: string) => void;
  onUpdateName: (taskId: string, newName: string) => void;
  resplittingTaskId: string | null;
  getRemainingTime: (taskId: string) => import('../types').RemainingTime;
  onCancelTimer: (taskId: string) => void;
  onRestore: (taskId: string) => void;
  domainPatterns?: DomainPattern[];
}

export const CompletedTaskList: React.FC<CompletedTaskListProps> = ({
  tasks,
  sortedCompletedTasks,
  tabContext,
  timersData,
  onDeleteTasks,
  onCompleteTasks,
  onMoveToCompleted,
  onReorder,
  onPause,
  onDelete,
  onComplete,
  onUpdateTime,
  onUpdateContext,
  onUpdateName,
  resplittingTaskId,
  getRemainingTime,
  onCancelTimer,
  onRestore,
  domainPatterns,
}) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
  };

  const totalCompletedTime = sortedCompletedTasks.reduce((sum, task) => sum + task.estimatedTime, 0);

  // 親タスク名でグループ化（完了したタスクも含む）
  const tasksByParent = tasks.reduce((acc, task) => {
    const parentName = task.parentTaskName || '独立タスク';
    if (!acc[parentName]) {
      acc[parentName] = [];
    }
    acc[parentName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="glass-card p-6 animate-enter">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            完了リスト
          </h2>
          {sortedCompletedTasks.length > 0 && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              合計: {formatTime(totalCompletedTime)}
            </span>
          )}
        </div>
        {sortedCompletedTasks.length > 0 && (
          <button
            onClick={() => {
              const completedTaskIds = sortedCompletedTasks.map((task) => task.id);
              onDeleteTasks(completedTaskIds);
            }}
            className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            全削除
          </button>
        )}
      </div>
      <div
        className="max-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto transition-all duration-200 custom-scrollbar"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          e.currentTarget.classList.add('border-green-400', 'dark:border-green-500', 'bg-green-50/50', 'dark:bg-green-900/20');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-green-400', 'dark:border-green-500', 'bg-green-50/50', 'dark:bg-green-900/20');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-green-400', 'dark:border-green-500', 'bg-green-50/50', 'dark:bg-green-900/20');
          
          const isParentGroup = e.dataTransfer.getData('isParentGroup');
          if (isParentGroup === 'true') {
            const parentGroupName = e.dataTransfer.getData('parentGroupName');
            const allCheckedStr = e.dataTransfer.getData('allChecked');
            
            if (allCheckedStr !== 'true') {
              alert('すべての子タスクにチェックを入れてから、完了リストにドロップしてください');
              return;
            }
            
            const groupTasks = tasks.filter(
              (t) => t.parentTaskName === parentGroupName && t.name !== parentGroupName
            );
            
            const taskIds = groupTasks.map(t => t.id);
            onCompleteTasks(taskIds);
            return;
          }
          
          const taskId = e.dataTransfer.getData('text/plain');
          if (taskId) {
            onMoveToCompleted(taskId);
          }
        }}
      >
        {sortedCompletedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-4">
            <div className="text-sm font-medium">完了したタスクをここにドラッグ</div>
          </div>
        ) : (
          <>
            {Object.entries(tasksByParent)
              .filter(([parentName]) => parentName !== '独立タスク')
              .map(([parentName, childTasks]) => {
                const childTasksWithoutParent = childTasks.filter((t) => t.name !== parentName);
                const allCompleted = childTasksWithoutParent.length > 0 && 
                                    childTasksWithoutParent.every((t) => t.status === 'completed');
                if (!allCompleted) return null;
                
                const groupTotalTime = childTasksWithoutParent.reduce((sum, task) => sum + task.estimatedTime, 0);
                const completedCount = childTasksWithoutParent.filter((t) => t.status === 'completed').length;
                
                return (
                  <div key={parentName} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-slate-700 dark:text-slate-200 block truncate">{parentName}</span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">
                            {formatTime(groupTotalTime)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {completedCount}/{childTasksWithoutParent.length} 完了
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const taskIds = childTasksWithoutParent.map((t) => t.id);
                          onDeleteTasks(taskIds);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors ml-2"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            
            {sortedCompletedTasks
              .filter((task) => !task.parentTaskName || task.parentTaskName === '独立タスク')
              .map((task, index) => (
                <div
                  key={task.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedTaskId = e.dataTransfer.getData('text/plain');
                    if (draggedTaskId) {
                      if (draggedTaskId === task.id) {
                        onReorder(draggedTaskId, index, sortedCompletedTasks);
                      } else {
                        onMoveToCompleted(draggedTaskId);
                      }
                    }
                  }}
                  className="opacity-75 hover:opacity-100 transition-opacity"
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
                    isDragging={false}
                    isDragOver={false}
                    showScore={false}
                    isResplitting={resplittingTaskId === task.id}
                    getRemainingTime={getRemainingTime}
                    onCancelTimer={onCancelTimer}
                    onRestore={onRestore}
                    domainPatterns={domainPatterns}
                  />
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};
