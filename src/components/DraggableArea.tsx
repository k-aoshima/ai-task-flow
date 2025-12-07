import React, { useState } from 'react';
import { LayoutAreaType } from '../types';

interface DraggableAreaProps {
  areaType: LayoutAreaType;
  isCustomizing: boolean;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  children: React.ReactNode;
}

/**
 * エリア名の日本語マッピング
 */
const AREA_NAMES: Record<LayoutAreaType, string> = {
  tabContext: 'タブコンテキスト',
  timeSummary: '時間サマリー',
  taskDecomposer: 'タスク作成フォーム',
  completedList: '完了リスト',
  currentTaskList: '実行中のタスク',
  allTaskList: '全タスクリスト',
};

/**
 * ドラッグ可能なエリアラッパーコンポーネント
 */
export const DraggableArea: React.FC<DraggableAreaProps> = ({
  areaType,
  isCustomizing,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isCustomizing) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isCustomizing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    onDragOver(index);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
    onDragEnd();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isCustomizing) return;
    e.preventDefault();
    setIsDragOver(false);
    onDrop(index);
  };

  return (
    <div
      draggable={isCustomizing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
      className={`relative transition-all duration-200 ${
        isCustomizing ? 'cursor-move' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${
        isDragOver ? 'scale-105' : ''
      }`}
    >
      {/* カスタマイズモード時のドラッグハンドル */}
      {isCustomizing && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 glass-card px-4 py-1.5 rounded-full shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900 animate-enter">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3h6v2H9V3zm0 4h6v2H9V7zm0 4h6v2H9v-2zm0 4h6v2H9v-2zm0 4h6v2H9v-2z" />
            </svg>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              {AREA_NAMES[areaType]}
            </span>
          </div>
        </div>
      )}

      {/* ドロップターゲットのハイライト */}
      {isCustomizing && isDragOver && !isDragging && (
        <div className="absolute inset-0 border-4 border-dashed border-blue-400 dark:border-blue-500 rounded-2xl bg-blue-50/20 dark:bg-blue-900/20 pointer-events-none z-10 animate-pulse" />
      )}

      {/* 実際のコンテンツ */}
      <div className={isCustomizing ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};
