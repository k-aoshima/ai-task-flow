import React from 'react';
import { useDomainPatterns } from '../hooks/useDomainPatterns';
import { DomainPatternManager } from './DomainPatternManager';

interface SettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  preferredModel: string;
  onPreferredModelChange: (model: string) => void;
  autoSwitchModels: boolean;
  onAutoSwitchModelsChange: (autoSwitch: boolean) => void;
  debugMode: boolean;
  onDebugModeChange: (debug: boolean) => void;
}

const AVAILABLE_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
  { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
];

/**
 * 設定コンポーネント
 */
export const Settings: React.FC<SettingsProps> = ({ 
  apiKey, 
  onApiKeyChange,
  preferredModel,
  onPreferredModelChange,
  autoSwitchModels,
  onAutoSwitchModelsChange,
  debugMode,
  onDebugModeChange
}) => {
  const {
    patterns,
    addPattern,
    updatePattern,
    deletePattern,
    resetToDefault,
  } = useDomainPatterns();

  return (
    <div className="p-4 space-y-6 animate-enter">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          AI・モデル設定
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Gemini API キー
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="APIキーを入力してください"
              className="input-field w-full"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              APIキーはブラウザのlocalStorageに暗号化されずに保存されます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                優先モデル
              </label>
              <select
                value={preferredModel}
                onChange={(e) => onPreferredModelChange(e.target.value)}
                className="input-field w-full"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                通常時に使用するモデルを選択します。
              </p>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                自動フォールバック
              </label>
              <div className="flex items-center h-full">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={autoSwitchModels}
                    onChange={(e) => onAutoSwitchModelsChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    制限時に他のモデルに切り替える
                  </span>
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                API制限(429)や過負荷時に、自動的に他の利用可能なモデルを試行します。
              </p>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                デバッグ設定
              </label>
              <div className="flex items-center h-full">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={debugMode}
                    onChange={(e) => onDebugModeChange(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    [Debug] タイマーを5秒に短縮
                  </span>
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                開発用設定：すべての新規タイマーを5秒で完了させます。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <DomainPatternManager
          patterns={patterns}
          onAdd={addPattern}
          onUpdate={updatePattern}
          onDelete={deletePattern}
          onReset={resetToDefault}
        />
      </div>
    </div>
  );
};
