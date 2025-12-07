import { useCallback } from 'react';
import { Task } from '../types';
import { reorderUnifiedList } from '../utils/taskUtils';

export const useTaskDragDrop = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  // 通常のリスト（サブセット）内での並び替え
  const handleReorder = useCallback((taskId: string, newIndex: number, targetList: Task[]) => {
    const taskIndex = targetList.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const newTaskList = [...targetList];
    const [movedTask] = newTaskList.splice(taskIndex, 1);
    newTaskList.splice(newIndex, 0, movedTask);

    // 順序を更新
    const updatedSubset = newTaskList.map((task, index) => ({
      ...task,
      order: index,
    }));

    // 全体のタスクリストを更新
    const newAllTasks = tasks.map((task) => {
      const updatedTask = updatedSubset.find((t) => t.id === task.id);
      return updatedTask || task;
    });

    setTasks(newAllTasks);
  }, [tasks, setTasks]);

  // 統合リスト（グループとタスク混合）での並び替え
  const handleReorderUnified = useCallback((
    draggedItemId: string, 
    draggedItemType: 'group' | 'task', 
    newIndex: number
  ) => {
    const newTasks = reorderUnifiedList(tasks, draggedItemId, draggedItemType, newIndex);
    setTasks(newTasks);
  }, [tasks, setTasks]);

  // グループ内の子タスク並び替え
  const handleReorderChild = useCallback((draggedTaskId: string, newIndex: number) => {
    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (!draggedTask || !draggedTask.parentTaskName) return;

    const parentName = draggedTask.parentTaskName;
    
    // 同じ親を持つ兄弟タスクを取得し、現在の順序でソート
    const siblings = tasks
      .filter(t => t.parentTaskName === parentName && t.name !== parentName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // 現在のorder値のリストを保存（再利用するため）
    const orderValues = siblings.map(t => t.order ?? 0);

    // 移動対象のタスクの現在のインデックス
    const currentIndex = siblings.findIndex(t => t.id === draggedTaskId);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    // 配列内で移動
    const newSiblings = [...siblings];
    const [moved] = newSiblings.splice(currentIndex, 1);
    newSiblings.splice(newIndex, 0, moved);

    // 新しい順序に基づいてorder値を再割り当て
    // もしorderValuesが足りない（新規追加などで）場合は、最小値から再計算などのロジックが必要だが
    // ここでは単純に既存のorder値を割り当てる（スロットの交換）
    const updates = newSiblings.map((t, idx) => ({
        id: t.id,
        order: orderValues[idx] // 並び替えられたタスクに、その位置に対応する古いorder値を付与
    }));

    // タスク全体を更新
    setTasks(prev => prev.map(t => {
        const update = updates.find(u => u.id === t.id);
        return update ? { ...t, order: update.order } : t;
    }));

  }, [tasks, setTasks]);

  return {
    handleReorder,
    handleReorderUnified,
    handleReorderChild
  };
};
