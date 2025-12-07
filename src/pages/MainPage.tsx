import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import { useLocalStorageString } from '../hooks/useLocalStorage';
import { useTabContext } from '../hooks/useTabContext';
import { useDomainPatterns } from '../hooks/useDomainPatterns';
import { useLayoutCustomization } from '../hooks/useLayoutCustomization';
import { createUnifiedDisplayList, reorderUnifiedList } from '../utils/taskUtils';
import { TabContextDisplay } from '../components/TabContextDisplay';
import { TaskDecomposer } from '../components/TaskDecomposer';
import { TaskList } from '../components/TaskList';
import { CompletedTaskList } from '../components/CompletedTaskList';
import { TimeSummary } from '../components/TimeSummary';
import { PauseTimeModal } from '../components/PauseTimeModal';
import { LayoutCustomizationToggle } from '../components/LayoutCustomizationToggle';
import { DraggableArea } from '../components/DraggableArea';
import { Task, LayoutAreaType } from '../types';
import { useTaskDragDrop } from '../hooks/useTaskDragDrop';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useTaskFiltering } from '../hooks/useTaskFiltering';

interface MainPageProps {
  onCustomizationToggleReady?: (toggle: React.ReactNode) => void;
}

/**
 * メインページコンポーネント
 */
export const MainPage: React.FC<MainPageProps> = ({ onCustomizationToggleReady }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // カスタムフック
  const { tasks, setTasks, addTasks, deleteTask, updateTask, deleteTasks } = useTasks();
  const { timersData, startTimer, cancelTimer, getRemainingTime } = useTimer();
  const { handleReorder } = useTaskDragDrop(tasks, setTasks);
  const [geminiApiKey] = useLocalStorageString('aiTaskFlow_apiKey', '');
  const tabContext = useTabContext();
  const { patterns: domainPatterns } = useDomainPatterns();
  const { isCustomizing, layoutConfig, reorderArea, toggleCustomizing, resetLayout } = useLayoutCustomization();
  const [resplittingTaskId, setResplittingTaskId] = useState<string | null>(null);
  const [pauseModalTask, setPauseModalTask] = useState<Task | null>(null);
  const [draggedAreaIndex, setDraggedAreaIndex] = useState<number | null>(null);

  // タスクのフィルタリングとソート（カスタムフックを使用）
  const {
      activeTasks,
      completedTasks,
      sortedCompletedTasks,
      currentListTasks,
      sortedTasks,
      suggestedTaskIds
  } = useTaskFiltering(tasks, tabContext, domainPatterns);

  // カスタマイズトグルを生成してコールバックで渡す
  React.useEffect(() => {
    if (onCustomizationToggleReady) {
      const toggle = (
        <LayoutCustomizationToggle
          isCustomizing={isCustomizing}
          onToggle={toggleCustomizing}
          onReset={resetLayout}
        />
      );
      onCustomizationToggleReady(toggle);
    }
  }, [isCustomizing, toggleCustomizing, resetLayout, onCustomizationToggleReady]);

  // タスクの削除（タイマーも考慮）
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    // このタスクのタイマーがあればキャンセル
    const hasTimer = timersData.some(timer => timer.taskId === taskId);
    if (hasTimer) {
      cancelTimer(taskId);
    }
  };

  // 複数タスクの削除（タイマーも考慮）
  const handleDeleteTasks = (taskIds: string[]) => {
    deleteTasks(taskIds);
    // 削除対象のタスクにタイマーがあればすべてキャンセル
    taskIds.forEach(taskId => {
      const hasTimer = timersData.some(timer => timer.taskId === taskId);
      if (hasTimer) {
        cancelTimer(taskId);
      }
    });
  };

  // タスクの完了
  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // チェックボックス制限を削除（子タスクは自由に完了できる）

    updateTask(taskId, { status: 'completed' });
    // タイマー中のタスクを完了する場合
    const hasTimer = timersData.some(timer => timer.taskId === taskId);
    if (hasTimer) {
      cancelTimer(taskId);
    }
  };

  // 複数タスクを一括で完了にする
  const handleCompleteTasks = (taskIds: string[]) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        taskIds.includes(task.id)
          ? { ...task, status: 'completed' as const }
          : task
      )
    );
  };

  // タスクの時間を更新
  const handleUpdateTime = (taskId: string, time: number) => {
    updateTask(taskId, { estimatedTime: time });
  };

  // タスクの環境を更新
  const handleUpdateContext = (taskId: string, contextKey: string) => {
    updateTask(taskId, { contextKey });
  };

  // タスク名を更新
  const handleUpdateName = (taskId: string, newName: string) => {
    updateTask(taskId, { name: newName });
  };

  // 親タスク名を更新（すべての子タスクのparentTaskNameも更新）
  const handleUpdateParentName = (oldParentName: string, newParentName: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.parentTaskName === oldParentName
          ? { ...task, parentTaskName: newParentName }
          : task
      )
    );
  };

  // タスクのチェック状態をトグル
  const handleToggleCheck = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const newCheckedState = !task.isChecked;
      console.log('チェックボックストグル:', task.name, 'isChecked:', task.isChecked, '->', newCheckedState);
      updateTask(taskId, { isChecked: newCheckedState });
    }
  };

  // タスクの再分割
  const handleResplitTask = async (task: Task) => {
    if (!geminiApiKey) {
      handleNavigateToSettings();
      return;
    }

    // ローディング状態を開始
    setResplittingTaskId(task.id);

    try {
      const { callGeminiAPI } = await import('../utils/geminiAPI');
      // タスク名でAI分割
      const taskName = task.name;
      
      // 設定をlocalStorageから直接読み込む
      const preferredModel = localStorage.getItem('aiTaskFlow_preferredModel') || 'gemini-1.5-flash';
      const autoSwitchModels = localStorage.getItem('aiTaskFlow_autoSwitchModels') !== 'false';

      const response = await callGeminiAPI(geminiApiKey, taskName, {
        preferredModel,
        autoSwitch: autoSwitchModels,
        onModelSwitch: (newModel) => {
            showToast(`API制限のため、モデルを ${newModel} に切り替えました`, 'warning', 5000);
        }
      });
      
      if (response && response.subTasks.length > 0) {
        console.log('AI分割実行:', {
          元のタスク: task.name,
          元のタスクID: task.id,
          新しい親タスク名: response.parentTaskName,
          サブタスク数: response.subTasks.length,
          サブタスク名一覧: response.subTasks.map(st => st.name)
        });
        
        // 新しいサブタスクを準備（親タスク名を設定）
        const newTasks: Task[] = response.subTasks
          .filter((subTask) => {
            const shouldInclude = subTask.name !== response.parentTaskName;
            if (!shouldInclude) {
              console.log('親タスク名と同じため除外:', subTask.name);
            }
            return shouldInclude;
          })
          .map((subTask) => ({
            id: crypto.randomUUID(),
            name: subTask.name,
            urgency: subTask.urgency,
            importance: subTask.importance,
            contextKey: subTask.contextKey,
            estimatedTime: subTask.estimatedTime,
            keywords: subTask.keywords || [],
            status: 'active' as const,
            isTopPriority: false,
            parentTaskName: response.parentTaskName,
          }));
        
        console.log('削除するタスクID:', task.id);
        console.log('追加する新しいタスク数:', newTasks.length);
        
        // 元のタスクを削除して新しいタスクを追加（1つの状態更新で実行）
        setTasks((prevTasks) => {
          const filtered = prevTasks.filter((t) => t.id !== task.id);
          console.log('削除後のタスク数:', filtered.length);
          const updated = [...filtered, ...newTasks];
          console.log('追加後のタスク数:', updated.length);
          return updated;
        });
      }
    } catch (error) {
      console.error('タスク再分割エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'タスク再分割に失敗しました';
      showToast(errorMessage, 'error');
    } finally {
      // ローディング状態を解除
      setResplittingTaskId(null);
    }
  };



  // タスクを完了リストに移動（ドラッグアンドドロップ）
  const handleMoveToCompleted = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
    const hasTimer = timersData.some(timer => timer.taskId === taskId);
    if (hasTimer) {
      cancelTimer(taskId);
    }
  };




  // タスクの保留（モーダルを表示）
  const handlePauseTask = (task: Task) => {
    setPauseModalTask(task);
  };

  // 保留時間を設定してタイマーを開始
  const handleConfirmPauseTime = (minutes: number) => {
    if (pauseModalTask) {
      startTimer(pauseModalTask, minutes);
      setPauseModalTask(null);
    }
  };

  // レイアウトエリアのドラッグハンドラ
  const handleAreaDragStart = (index: number) => {
    setDraggedAreaIndex(index);
  };

  const handleAreaDragOver = (_index: number) => {
    // ドラッグオーバー時の処理（必要に応じて実装）
  };

  const handleAreaDragEnd = () => {
    setDraggedAreaIndex(null);
  };

  const handleAreaDrop = (toIndex: number) => {
    if (draggedAreaIndex !== null && draggedAreaIndex !== toIndex) {
      reorderArea(draggedAreaIndex, toIndex);
    }
    setDraggedAreaIndex(null);
  };



  // タスク生成時の処理
  const handleTasksGenerated = (newTasks: Task[]) => {
    addTasks(newTasks);
  };

  // 設定画面への遷移
  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  // タスク移動・並び替えハンドラ
  const handleMoveTask = (draggedId: string, type: 'group' | 'task', index: number, targetIsCurrent: boolean) => {
    // ソースリストの判定（グループの場合は代表タスクから判定するか、現状はタスクのみ対応でガード）
    let sourceIsCurrent = false;

    if (type === 'group') {
        const groupTasks = tasks.filter(t => t.parentTaskName === draggedId && t.name !== draggedId);
        if (groupTasks.length > 0) sourceIsCurrent = !!groupTasks[0].isCurrent;
    } else {
        const task = tasks.find(t => t.id === draggedId);
        if (task) sourceIsCurrent = !!task.isCurrent;
    }

    if (sourceIsCurrent === targetIsCurrent) {
        // リスト内の並び替え
        const targetList = targetIsCurrent ? currentListTasks : sortedTasks;
        
        // 並び替えロジック（utilsを利用）
        const reorderedSubset = reorderUnifiedList(targetList, draggedId, type, index);
        
        // 全体リストに反映
        setTasks(prev => prev.map(t => {
            // ターゲットリストにないタスクは変更しない
            // isCurrentがundefinedの場合はfalseとして扱う
            const taskIsCurrent = !!t.isCurrent;
            if (taskIsCurrent !== targetIsCurrent) return t;
            
            const found = reorderedSubset.find(r => r.id === t.id);
            return found ? { ...t, order: found.order } : t;
        }));
    } else {
        // リスト間の移動
        const targetList = targetIsCurrent ? currentListTasks : sortedTasks;
        const unified = createUnifiedDisplayList(targetList);
        
        let newOrder = 0;
        if (unified.length === 0) {
            newOrder = 0;
        } else if (index <= 0) {
             const firstItem = unified[0];
             const firstOrder = firstItem.type === 'task' ? firstItem.task.order : firstItem.tasks[0].order;
             newOrder = (firstOrder ?? 0) - 1000;
        } else if (index >= unified.length) {
             const lastItem = unified[unified.length - 1];
             const lastOrder = lastItem.type === 'task' ? lastItem.task.order : lastItem.tasks[lastItem.tasks.length-1].order;
             newOrder = (lastOrder ?? 0) + 1000;
        } else {
             const prevItem = unified[index - 1];
             const nextItem = unified[index];
             
             const getOrder = (item: any) => item.type === 'task' ? item.task.order : item.tasks[0].order;
             const prevOrder = getOrder(prevItem) ?? 0;
             const nextOrder = getOrder(nextItem) ?? 0;
             newOrder = (prevOrder + nextOrder) / 2;
        }

        if (type === 'group') {
             // グループ一括移動
             const groupTasks = tasks
                 .filter(t => t.parentTaskName === draggedId && t.name !== draggedId)
                 .sort((a,b) => (a.order??0) - (b.order??0));
             
             setTasks(prev => prev.map(t => {
                 const idx = groupTasks.findIndex(g => g.id === t.id);
                 if (idx !== -1) {
                     return { ...t, isCurrent: targetIsCurrent, order: newOrder + idx };
                 }
                 return t;
             }));
        } else {
            // 単一タスク移動
            updateTask(draggedId, { 
               isCurrent: targetIsCurrent,
               order: newOrder
            });
        }
    }
  };

  // レイアウトエリアをレンダリングする関数
  const renderArea = (areaType: LayoutAreaType) => {
    switch (areaType) {
      case 'tabContext':
        return <TabContextDisplay key="tabContext" tabContext={tabContext} />;

      case 'timeSummary':
        return <TimeSummary tasks={tasks} activeTasks={activeTasks} completedTasks={completedTasks} />;

      case 'taskDecomposer':
        return (
          <TaskDecomposer
            key="taskDecomposer"
            apiKey={geminiApiKey}
            onTasksGenerated={handleTasksGenerated}
            onNavigateToSettings={handleNavigateToSettings}
          />
        );

      case 'completedList':
        return (
          <CompletedTaskList
            tasks={tasks} // Pass all tasks for group filtering logic inside
            sortedCompletedTasks={sortedCompletedTasks}
            tabContext={tabContext}
            timersData={timersData}
            onDeleteTasks={handleDeleteTasks}
            onCompleteTasks={handleCompleteTasks}
            onMoveToCompleted={handleMoveToCompleted}
            onReorder={(taskId, index, list) => handleReorder(taskId, index, list)}
            onPause={handlePauseTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
            onUpdateTime={handleUpdateTime}
            onUpdateContext={handleUpdateContext}
            onUpdateName={handleUpdateName}
            resplittingTaskId={resplittingTaskId}
            getRemainingTime={getRemainingTime}
            onCancelTimer={cancelTimer}
          />
        );

      case 'currentTaskList':
        return (
          <div key="currentTaskList" className="animate-enter">
            <TaskList
                tasks={currentListTasks}
                tabContext={tabContext}
                timersData={timersData}
                onPause={handlePauseTask}
                onDelete={handleDeleteTask}
                onDeleteTasks={handleDeleteTasks}
                onComplete={handleCompleteTask}
                onCompleteTasks={handleCompleteTasks}
                onUpdateTime={handleUpdateTime}
                onUpdateContext={handleUpdateContext}
                onUpdateName={handleUpdateName}
                onUpdateParentName={handleUpdateParentName}
                onResplit={handleResplitTask}
                onToggleCheck={handleToggleCheck}
                onReorder={(taskId, newIndex) => handleMoveTask(taskId, 'task', newIndex, true)}
                onReorderUnified={(id, type, index) => handleMoveTask(id, type, index, true)}
                title="🚀 実行中のタスク"
                enableDragAndDrop={!isCustomizing}
                resplittingTaskId={resplittingTaskId}
                useGrouping={true}
                allTasks={tasks}
                suggestedTaskIds={suggestedTaskIds}
                getRemainingTime={getRemainingTime}
                onCancelTimer={cancelTimer}
            />
          </div>
        );

      case 'allTaskList':
        return sortedTasks.length > 0 ? (
           <div key="allTaskList" className="animate-enter">
            <TaskList
                tasks={sortedTasks}
                tabContext={tabContext}
                timersData={timersData}
                onPause={handlePauseTask}
                onDelete={handleDeleteTask}
                onDeleteTasks={handleDeleteTasks}
                onComplete={handleCompleteTask}
                onCompleteTasks={handleCompleteTasks}
                onUpdateTime={handleUpdateTime}
                onUpdateContext={handleUpdateContext}
                onUpdateName={handleUpdateName}
                onUpdateParentName={handleUpdateParentName}
                onResplit={handleResplitTask}
                onToggleCheck={handleToggleCheck}
                onReorder={(taskId, newIndex) => handleMoveTask(taskId, 'task', newIndex, false)}
                onReorderUnified={(id, type, index) => handleMoveTask(id, type, index, false)}
                title="全タスクリスト"
                enableDragAndDrop={!isCustomizing}
                resplittingTaskId={resplittingTaskId}
                useGrouping={true}
                allTasks={tasks}
                suggestedTaskIds={suggestedTaskIds}
                getRemainingTime={getRemainingTime}
                onCancelTimer={cancelTimer}
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 font-sans text-slate-800 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* レイアウト設定に基づいてエリアを動的にレンダリング */}
        {layoutConfig.areas.map((areaType, index) => {
          const areaContent = renderArea(areaType);
          
          // nullの場合はスキップ（条件付きレンダリング）
          if (!areaContent) return null;

          return (
            <DraggableArea
              key={areaType}
              areaType={areaType}
              isCustomizing={isCustomizing}
              index={index}
              onDragStart={handleAreaDragStart}
              onDragOver={handleAreaDragOver}
              onDragEnd={handleAreaDragEnd}
              onDrop={handleAreaDrop}
            >
              {areaContent}
            </DraggableArea>
          );
        })}

        {/* タスクがない場合の表示 */}
        {tasks.length === 0 && (
          <div className="glass-card p-12 animate-enter text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">タスクがありません</h3>
            <p className="text-slate-500 dark:text-slate-400">
                フォームからタスクを追加して、フロー状態へ。
            </p>
          </div>
        )}

        {/* 保留時間設定モーダル */}
        {pauseModalTask && (
          <PauseTimeModal
            isOpen={!!pauseModalTask}
            onClose={() => setPauseModalTask(null)}
            onConfirm={handleConfirmPauseTime}
            taskName={pauseModalTask.name}
          />
        )}
      </div>
    </div>
  );
};
