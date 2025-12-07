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

  return {
    handleReorder,
    handleReorderUnified
  };
};
