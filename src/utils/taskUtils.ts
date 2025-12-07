import { Task, DisplayItem } from '../types';

/**
 * タスクリストを表示用の統一リスト形式（グループと独立タスクの混在リスト）に変換する
 * @param tasks 全タスクリスト
 * @returns 表示用のDisplayItem配列
 */
export const createUnifiedDisplayList = (tasks: Task[]): DisplayItem[] => {
  // 並び替えは呼び出し元（MainPageなど）で完了している前提とし、ここでは入力順序を維持する
  // これによりAIスコア順などの複雑なソート条件が維持される
  const sortedTasks = [...tasks];
  
  const items: DisplayItem[] = [];
  const processedGroups = new Set<string>();
  
  for (const task of sortedTasks) {
    const parentName = task.parentTaskName;
    
    if (parentName && parentName !== '独立タスク' && task.name !== parentName) {
      // 親タスクグループ
      if (!processedGroups.has(parentName)) {
        processedGroups.add(parentName);
        const groupTasks = tasks.filter(t => t.parentTaskName === parentName && t.name !== parentName);
        items.push({ type: 'group', parentName, tasks: groupTasks });
      }
    } else {
      // 独立タスク（または親タスク自体だが、それは通常表示しないか独立扱い）
      if (task.name === parentName) continue; // 親タスク定義自体はスキップ
      items.push({ type: 'task', task });
    }
  }
  return items;
};

/**
 * インデックスに基づいてタスクリストの順序を更新する
 * 
 * @param tasks 現在のタスクリスト
 * @param draggedItemId ドラッグされたアイテムのID（タスクIDまたはグループ名）
 * @param draggedItemType ドラッグされたアイテムのタイプ
 * @param newIndex 移動先のインデックス
 * @returns 更新されたタスクリスト
 */
export const reorderUnifiedList = (
  tasks: Task[], 
  draggedItemId: string, 
  draggedItemType: 'group' | 'task', 
  newIndex: number
): Task[] => {
  const activeTasks = tasks.filter((t) => t.status === 'active');
  
  // 統合リストを作成
  const unifiedList = createUnifiedDisplayList(activeTasks);
  
  // ドラッグされたアイテムのインデックスを見つける
  let draggedIndex = -1;
  if (draggedItemType === 'group') {
    draggedIndex = unifiedList.findIndex(item => item.type === 'group' && item.parentName === draggedItemId);
  } else {
    draggedIndex = unifiedList.findIndex(item => item.type === 'task' && item.task.id === draggedItemId);
  }
  
  if (draggedIndex === -1 || draggedIndex === newIndex) {
    return tasks; // 変更なし
  }
  
  // 位置を入れ替える
  const newList = [...unifiedList];
  const [movedItem] = newList.splice(draggedIndex, 1);
  newList.splice(newIndex, 0, movedItem);
  
  // 新しい順序でorderを再割り当て
  // 元のタスクリストをマップして、新しい順序を適用
  return tasks.map((task) => {
    // アクティブでないタスクは変更しない
    if (task.status !== 'active') return task;

    let newOrder = Infinity;
    
    // newList内での位置を探す
    for (let i = 0; i < newList.length; i++) {
        const item = newList[i];
        if (item.type === 'group' && task.parentTaskName === item.parentName && task.name !== item.parentName) {
             // グループ内の順序
             const groupInnerIndex = item.tasks.findIndex(t => t.id === task.id);
             newOrder = i * 1000 + (groupInnerIndex !== -1 ? groupInnerIndex : 0);
             break;
        } else if (item.type === 'task' && task.id === item.task.id) {
            newOrder = i * 1000;
             break;
        }
    }

    if (newOrder !== Infinity) {
      return { ...task, order: newOrder };
    }
    return task;
  });
};
