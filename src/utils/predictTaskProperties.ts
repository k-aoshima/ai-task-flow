/**
 * タスクのプロパティ（緊急度、重要度、環境、推定時間）を予測する
 */
import { getAvailableGeminiModels, GeminiAPIOptions } from './geminiAPI';

export interface TaskProperties {
  urgency: number;
  importance: number;
  contextKey: string;
  estimatedTime: number;
  keywords?: string[];
}

export const predictTaskProperties = async (
  apiKey: string,
  taskName: string,
  options: GeminiAPIOptions = {}
): Promise<TaskProperties> => {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません');
  }

  if (!taskName.trim()) {
    throw new Error('タスク名を入力してください');
  }

  const { preferredModel, autoSwitch = true, onModelSwitch } = options;

  try {
    // 利用可能なモデルを取得
    const allModels = await getAvailableGeminiModels(apiKey);
    
    // モデルリストの構築
    let modelsToTry: string[] = [];
  
    if (preferredModel) {
      const others = allModels.filter(m => m !== preferredModel);
      modelsToTry = [preferredModel, ...others];
    } else {
      modelsToTry = allModels;
    }
  
    // 自動切り替え無効時は最初のモデルのみ
    if (!autoSwitch) {
      modelsToTry = [modelsToTry[0]];
    }

    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`モデル ${modelName} で実行中...`);
        const result = await predictTaskPropertiesWithModel(apiKey, taskName, modelName);
        
        // フォールバック発生時の通知
        if (modelName !== modelsToTry[0] && onModelSwitch) {
            onModelSwitch(modelName);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        if (!autoSwitch) {
            throw error;
        }

        const isRetryable = 
            error.message.includes('429') || 
            error.message.includes('Quota exceeded') ||
            error.message.includes('503') ||
            error.message.includes('Overloaded') ||
            error.message.includes('404') ||
            error.message.includes('not found') ||
            error.message.includes('not supported');

        if (isRetryable) {
            console.warn(`モデル ${modelName} でエラーが発生しました (Retryable): ${error.message}. 次のモデルを試します。`);
            continue;
        }
        throw error;
      }
    }
    
    throw lastError || new Error('全てのモデルでリクエストが失敗しました');

  } catch (error) {
    console.error('タスクプロパティ予測エラー:', error);
    // エラー時はデフォルト値を返す
    return {
      urgency: 2,
      importance: 3,
      contextKey: 'None',
      estimatedTime: 30,
      keywords: [],
    };
  }
};

const predictTaskPropertiesWithModel = async (
    apiKey: string, 
    taskName: string, 
    modelName: string
): Promise<TaskProperties> => {
    // Gemini APIのエンドポイント (v1beta)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // プロンプトを構築
    const prompt = `以下のタスクの緊急度、重要度、実行環境、推定所要時間を予測してください。

タスク: ${taskName}

以下のJSON形式で回答してください（JSONのみ、説明不要）:
{
  "urgency": 1-4の整数（1=低、2=中、3=高、4=緊急）,
  "importance": 1-5の整数（1=低、2=中低、3=中、4=中高、5=高）,
  "contextKey": "None" | "Development" | "Testing" | "DeployConsole" | "Documentation" | "Meeting" | "Review" | "Planning",
  "estimatedTime": 分単位の整数（5-480分の範囲）,
  "keywords": ["キーワード1", "キーワード2"]
}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `APIエラー: ${response.status}`
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSONを抽出（コードブロックがあれば除去）
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const properties = JSON.parse(jsonText) as TaskProperties;

    // バリデーションとデフォルト値
    return {
      urgency: Math.max(1, Math.min(4, properties.urgency || 2)),
      importance: Math.max(1, Math.min(5, properties.importance || 3)),
      contextKey: properties.contextKey || 'None',
      estimatedTime: Math.max(5, Math.min(480, properties.estimatedTime || 30)),
      keywords: properties.keywords || [],
    };
};
