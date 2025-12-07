import { useState } from 'react';
import { callGeminiAPI } from '../utils/geminiAPI';
import { GeminiResponse } from '../types';
import { useToast } from '../components/ToastProvider';

/**
 * Gemini API呼び出しのカスタムフック
 */
export const useGeminiAPI = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { showToast } = useToast();

  const decomposeTask = async (prompt: string): Promise<GeminiResponse | null> => {
    if (!prompt.trim()) {
      setError('タスクを入力してください');
      return null;
    }

    if (!apiKey) {
      setError('APIキーを設定してください');
      return null;
    }

    setIsLoading(true);
    setError('');

    // 設定をlocalStorageから直接読み込む（最新の値を反映させるため）
    const preferredModel = localStorage.getItem('aiTaskFlow_preferredModel') || 'gemini-1.5-flash';
    const autoSwitchModels = localStorage.getItem('aiTaskFlow_autoSwitchModels') !== 'false';

    try {
      const response = await callGeminiAPI(apiKey, prompt, {
        preferredModel,
        autoSwitch: autoSwitchModels,
        onModelSwitch: (newModel) => {
            showToast(`API制限のため、モデルを ${newModel} に切り替えました`, 'warning', 5000);
        }
      });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タスク分解に失敗しました';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    decomposeTask,
    setError,
  };
};
