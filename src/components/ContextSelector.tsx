import React from 'react';
import { CONTEXT_OPTIONS, ContextKey } from '../constants/contextKeys';

interface ContextSelectorProps {
  currentContext: ContextKey;
  onContextChange: (context: ContextKey) => void;
}

/**
 * 作業環境選択コンポーネント
 */
export const ContextSelector: React.FC<ContextSelectorProps> = ({
  currentContext,
  onContextChange,
}) => {
  return (
    <div className="bg-white border border-gray-300 p-4 rounded">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        現在の作業環境
      </label>
      <select
        value={currentContext}
        onChange={(e) => onContextChange(e.target.value as ContextKey)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        {CONTEXT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

