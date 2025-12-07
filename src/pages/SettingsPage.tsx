import React from 'react';
import { useLocalStorage, useLocalStorageString } from '../hooks/useLocalStorage';
import { Settings } from '../components/Settings';

/**
 * 設定ページコンポーネント
 */
export const SettingsPage: React.FC = () => {
  const [geminiApiKey, setGeminiApiKey] = useLocalStorageString('aiTaskFlow_apiKey', '');
  const [preferredModel, setPreferredModel] = useLocalStorageString('aiTaskFlow_preferredModel', 'gemini-1.5-flash');
  const [autoSwitchModels, setAutoSwitchModels] = useLocalStorage('aiTaskFlow_autoSwitchModels', true);

  return (
    <Settings 
      apiKey={geminiApiKey} 
      onApiKeyChange={setGeminiApiKey}
      preferredModel={preferredModel}
      onPreferredModelChange={setPreferredModel}
      autoSwitchModels={autoSwitchModels}
      onAutoSwitchModelsChange={setAutoSwitchModels}
    />
  );
};
