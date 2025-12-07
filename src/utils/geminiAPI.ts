import { GeminiResponse } from '../types';

const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * 利用可能なGeminiモデルのリストを優先度順に取得
 */
export async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      console.warn('モデル一覧取得エラー: デフォルトリストを使用します');
      return PREFERRED_MODELS;
    }

    const data = await response.json();
    const models = data.models || [];
    
    // APIから取得できたモデル名のリスト
    const availableModelNames = models
      .map((m: any) => m.name.replace('models/', ''))
      .filter((name: string) => {
        // generateContentメソッドをサポートしているか確認
        const model = models.find((m: any) => m.name.endsWith(name));
        return model?.supportedGenerationMethods?.includes('generateContent');
      });

    console.log('APIから取得可能なモデル:', availableModelNames);

    // 優先順位リストに基づいて、利用可能なモデルをフィルタリング・並べ替え
    const sortedModels: string[] = [];
    const seen = new Set<string>();

    // 1. 優先リストにあるモデルを順に追加
    for (const pref of PREFERRED_MODELS) {
      if (seen.has(pref)) continue;

      // 完全一致または前方一致で探す
      const matched = availableModelNames.find((name: string) => 
        name === pref || name.startsWith(pref)
      );

      if (matched && !seen.has(matched)) {
        sortedModels.push(matched);
        seen.add(matched);
      } else if (availableModelNames.includes(pref)) {
          // リストに直接含まれている場合（念のため）
          sortedModels.push(pref);
          seen.add(pref);
      }
    }

    // 2. その他の利用可能なモデルを追加
    for (const name of availableModelNames) {
      if (!seen.has(name)) {
        sortedModels.push(name);
        seen.add(name);
      }
    }

    // モデルが見つからない場合はデフォルトリストを返す
    if (sortedModels.length === 0) {
        return PREFERRED_MODELS;
    }

    console.log('使用予定のモデルリスト（優先順）:', sortedModels);
    return sortedModels;

  } catch (error) {
    console.error('モデル取得エラー:', error);
    return PREFERRED_MODELS;
  }
}

/**
 * 後方互換性のため残す: 最も優先度の高いモデルを返す
 */
export async function getAvailableGeminiModel(apiKey: string): Promise<string> {
    const models = await getAvailableGeminiModels(apiKey);
    return models[0] || 'gemini-2.5-flash';
}

export interface GeminiAPIOptions {
  preferredModel?: string;
  autoSwitch?: boolean;
  onModelSwitch?: (newModel: string) => void;
}

/**
 * Gemini APIコール（実際のAPIを使用）
 * 429エラー時は次のモデルでリトライする
 */
export const callGeminiAPI = async (
  apiKey: string, 
  prompt: string,
  options: GeminiAPIOptions = {}
): Promise<GeminiResponse> => {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません');
  }

  if (!prompt.trim()) {
    throw new Error('タスクを入力してください');
  }

  const { preferredModel, autoSwitch = true, onModelSwitch } = options;

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
  
  // 各モデルで試行
  let lastError: Error | null = null;
  
  for (const modelName of modelsToTry) {
    try {
        console.log(`モデル ${modelName} で実行中...`);
        const result = await callGeminiAPIWithModel(apiKey, prompt, modelName);
        
        // フォールバック発生時の通知
        if (modelName !== modelsToTry[0] && onModelSwitch) {
            onModelSwitch(modelName);
        }
        
        return result;
    } catch (error: any) {
        lastError = error;
        
        // 自動切り替えが無効な場合は即座に失敗
        if (!autoSwitch) {
            throw error;
        }

        // 429 (Resource Exhausted) または 503 (Service Unavailable) または 404 (Model Not Found) の場合リトライ
        // 404もモデル廃止の可能性があるのでリトライ対象とする
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
        
        // その他のエラーは即座にスロー
        throw error;
    }
  }

  throw lastError || new Error('全てのモデルでリクエストが失敗しました');
};

const callGeminiAPIWithModel = async (apiKey: string, prompt: string, modelName: string): Promise<GeminiResponse> => {
    // Gemini APIのエンドポイント（v1betaを使用）
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // プロンプトを構築（JSON形式のレスポンスを要求）- 詳細版
    const systemInstruction = `あなたはタスク管理の専門家です。与えられたタスクを分析し、実行可能なサブタスクに分解してください。

【タスク分解のルール - 重要】
1. 各サブタスクの推定所要時間は必ず30分以下にする（厳守）
2. 推定所要時間が30分を超えるタスクは、必ず複数のサブタスクに分割する（例外なし）
3. 各サブタスクは独立して実行可能な単位にする
4. タスクの性質上、分解が困難な場合でも、30分を超える場合は必ず分割する

【タスク分解の判断基準】
- 30分以下のタスク → 1つのサブタスク（分解しない）
- 30分を超えるタスク → 必ず2個以上のサブタスクに分割（各サブタスクは30分以下）
- 60分のタスク → 2-3個のサブタスクに分割（各サブタスクは30分以下）
- 90分のタスク → 3-4個のサブタスクに分割（各サブタスクは30分以下）

【各サブタスクに必要な情報】
- name: タスク名（具体的で実行可能な内容）
- urgency: 緊急度（1=低、2=中、3=高、4=最優先）
- importance: 重要度（1=低、2=中、3=高、4=重要、5=最重要）
- contextKey: 作業環境（Gmail/Drive/DeployConsole/Noneのいずれか）
- estimatedTime: 推定所要時間（分単位、1-30の範囲、各サブタスクは必ず30分以下）
- keywords: 関連キーワード（配列形式、3-5個程度）

【出力形式】
- JSON形式のみを返す
- コードブロック（\`\`\`jsonなど）は使用しない
- 説明文やコメントは一切含めない
- 純粋なJSONオブジェクトのみを返す

【出力例 - 30分を超えるタスクの場合】
{
  "parentTaskName": "Jurise-128の制約変更",
  "subTasks": [
    {
      "name": "Jurise-128の制約変更要件を確認する",
      "urgency": 3,
      "importance": 4,
      "contextKey": "None",
      "estimatedTime": 20,
      "keywords": ["Jurise-128", "制約", "要件確認"]
    },
    {
      "name": "Jurise-128の制約変更の実装計画を立てる",
      "urgency": 3,
      "importance": 4,
      "contextKey": "None",
      "estimatedTime": 25,
      "keywords": ["Jurise-128", "制約", "計画", "設計"]
    },
    {
      "name": "Jurise-128の制約変更を実装する",
      "urgency": 3,
      "importance": 5,
      "contextKey": "None",
      "estimatedTime": 30,
      "keywords": ["Jurise-128", "制約", "実装", "開発"]
    }
  ]
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemInstruction}\n\nタスク: ${prompt}\n\nJSONのみ返す。`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3072, // 思考プロセスを使うモデルの場合も考慮して増やす
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `APIエラー: ${response.status} ${response.statusText}`;
      console.error('Gemini API エラー詳細:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        modelName: modelName,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Gemini APIレスポンス全体:', JSON.stringify(data, null, 2));

    // Gemini APIのレスポンスからテキストを取得
    if (!data.candidates || !data.candidates[0]) {
      console.error('Gemini APIレスポンス:', JSON.stringify(data, null, 2));
      throw new Error('Gemini APIからの応答にcandidatesがありません');
    }

    const candidate = data.candidates[0];
    
    // finishReasonをチェック
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.warn('finishReason:', candidate.finishReason);
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('コンテンツが安全性フィルターによってブロックされました');
      }
      if (candidate.finishReason === 'MAX_TOKENS') {
        throw new Error('レスポンスが最大トークン数に達しました。より短いタスクを入力するか、サブタスクの数を減らしてください。');
      }
    }

    if (!candidate.content) {
      console.error('Gemini APIレスポンス:', JSON.stringify(data, null, 2));
      throw new Error('Gemini APIからの応答にcontentがありません');
    }

    const content = candidate.content;
    
    // partsが存在しない場合や空の場合の処理
    if (!content.parts || !Array.isArray(content.parts) || content.parts.length === 0) {
      // MAX_TOKENSの場合、partsが空になることがある
      if (candidate.finishReason === 'MAX_TOKENS') {
        throw new Error('レスポンスが最大トークン数に達しました。より短いタスクを入力するか、サブタスクの数を減らしてください。');
      }
      console.error('Gemini APIレスポンス:', JSON.stringify(data, null, 2));
      console.error('content構造:', JSON.stringify(content, null, 2));
      throw new Error('Gemini APIからの応答にpartsがありません');
    }

    const firstPart = content.parts[0];
    
    // textプロパティを取得（functionCallの場合は別処理）
    let responseText: string;
    if (firstPart.text) {
      responseText = firstPart.text;
    } else if (firstPart.functionCall) {
      // Function Callingの場合はargsから取得
      responseText = JSON.stringify(firstPart.functionCall.args || {});
    } else {
      console.error('parts[0]構造:', JSON.stringify(firstPart, null, 2));
      throw new Error('Gemini APIからの応答にtextまたはfunctionCallがありません');
    }

    console.log('Gemini API応答テキスト:', responseText.substring(0, 500));

    // JSONをパース
    let parsedResponse: GeminiResponse;
    try {
      let jsonText = responseText.trim();
      
      // コードブロック内のJSONを探す
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      
      // 複数のJSONオブジェクトが含まれている場合、最初の1つだけを抽出
      // 最初の{から、対応する}までを探す（ネストされた{}も考慮）
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace === -1) {
        throw new Error('JSONオブジェクトが見つかりません');
      }
      
      let braceCount = 0;
      let endBrace = -1;
      for (let i = firstBrace; i < jsonText.length; i++) {
        if (jsonText[i] === '{') {
          braceCount++;
        } else if (jsonText[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endBrace = i;
            break;
          }
        }
      }
      
      if (endBrace === -1) {
        throw new Error('JSONオブジェクトが不完全です');
      }
      
      // 最初のJSONオブジェクトのみを抽出
      jsonText = jsonText.substring(firstBrace, endBrace + 1);
      
      // JSONをパース
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError);
      console.error('パースしようとしたテキスト:', responseText);
      // エラーの詳細を確認
      if (parseError instanceof SyntaxError) {
        console.error('JSON構文エラー位置:', parseError.message);
      }
      throw new Error(`APIレスポンスの解析に失敗しました: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // レスポンスの検証と正規化
    if (!parsedResponse.subTasks || !Array.isArray(parsedResponse.subTasks)) {
      throw new Error('APIレスポンスの形式が正しくありません');
    }

    // 各サブタスクを正規化
    const normalizedSubTasks = parsedResponse.subTasks.map((subTask: any) => ({
      name: subTask.name || '未命名タスク',
      urgency: Math.max(1, Math.min(4, parseInt(String(subTask.urgency)) || 2)),
      importance: Math.max(1, Math.min(5, parseInt(String(subTask.importance)) || 3)),
      contextKey: subTask.contextKey || 'None',
      estimatedTime: Math.max(1, parseInt(String(subTask.estimatedTime)) || 30),
      keywords: Array.isArray(subTask.keywords) ? subTask.keywords : [],
    }));

    return {
      parentTaskName: parsedResponse.parentTaskName || prompt.substring(0, 50),
      subTasks: normalizedSubTasks,
    };
};
