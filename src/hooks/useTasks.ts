import { useLocalStorage } from './useLocalStorage';
import { Task } from '../types';

/**
 * タスク管理のカスタムフック
 */
export const useTasks = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('aiTaskFlow_tasks', []);

  const addTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteTasks = (taskIds: string[]) => {
    setTasks((prev) => prev.filter((task) => !taskIds.includes(task.id)));
  };

  return {
    tasks,
    setTasks,
    addTasks,
    deleteTask,
    updateTask,
    deleteTasks,
  };
};

