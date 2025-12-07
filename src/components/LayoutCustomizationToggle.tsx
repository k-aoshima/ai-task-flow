import React from 'react';

interface LayoutCustomizationToggleProps {
  isCustomizing: boolean;
  onToggle: () => void;
  onReset: () => void;
}

/**
 * レイアウトカスタマイズのトグルボタンコンポーネント
 */
export const LayoutCustomizationToggle: React.FC<LayoutCustomizationToggleProps> = ({
  isCustomizing,
  onToggle,
  onReset,
}) => {
  return (
    <div className="flex items-center gap-1">
      {/* リセットボタン（カスタマイズモードON時のみ表示） */}
      {isCustomizing && (
        <button
          onClick={onReset}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
          title="デフォルトレイアウトにリセット"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {/* カスタマイズトグルボタン */}
      <button
        onClick={onToggle}
        className={`p-2 rounded-md transition-colors duration-200 relative ${
          isCustomizing
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={isCustomizing ? 'カスタマイズモードを終了' : 'レイアウトをカスタマイズ'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        {isCustomizing && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
        )}
      </button>
    </div>
  );
};
