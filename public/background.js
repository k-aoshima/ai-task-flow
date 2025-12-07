// サイドパネルを開くためのバックグラウンドスクリプト
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

// Offscreen Documentのセットアップ
async function setupOffscreenDocument(path) {
  // すでに存在するかチェック
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(path)]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // 作成
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Notification sound',
    });
    await creating;
    creating = null;
  }
}

let creating; // Promise holder

// アラーム検知
chrome.alarms.onAlarm.addListener(async (alarm) => {
  let taskId = alarm.name;
  let taskName = "タスク";
  let title = "保留タイマー終了";
  let message = "タスクの保留時間が終了しました。";

  try {
    const parsed = JSON.parse(alarm.name);
    if (parsed && parsed.taskId && parsed.taskName) {
        taskId = parsed.taskId;
        taskName = parsed.taskName;
        message = `「${taskName}」の保留時間が終了しました。`;
    }
  } catch (e) {
    // Legacy support or plain ID
    // 既存のストレージフォールバックを使う
    const result = await chrome.storage.local.get(['aiTaskFlow_timersData']);
    const timersData = result.aiTaskFlow_timersData || [];
    const timer = timersData.find((t) => t.taskId === taskId);
    if (timer && timer.originalTask) {
        taskName = timer.originalTask.name;
        message = `「${taskName}」の保留時間が終了しました。`;
    }
  }

  // 通知設定を確認
  const settings = await chrome.storage.local.get(['aiTaskFlow_enableTimerNotifications']);
  const enableNotifications = settings.aiTaskFlow_enableTimerNotifications !== false; // デフォルトはtrue

  if (!enableNotifications) {
      console.log("Timer notifications are disabled by user.");
      return;
  }

  // 1. 音声を再生 (Offscreen Document経由)
  try {
      await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
      chrome.runtime.sendMessage({ type: 'play-sound' });
  } catch (err) {
      console.error("Audio playback failed:", err);
  }

  // 2. ポップアップウィンドウを作成して通知 (最前面に表示)
  // screen APIはService Workerでは使えないため、固定サイズで表示
  const width = 500;
  const height = 500;

  // 直近のアクティブなウィンドウIDを取得して、その近くに出す... といきたいが、
  // シンプルに新しいウィンドウをポップアップさせる
  chrome.windows.create({
      url: `alert.html?taskName=${encodeURIComponent(taskName)}`,
      type: 'popup',
      width: width,
      height: height,
      focused: true, // フォーカスを奪う (ユーザーの要望)
      state: 'normal' 
  });
});

// 通知がクリックされたらサイドパネルを開く (直近のウィンドウで)
chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.windows.getLastFocused((lastFocusedWindow) => {
        if (lastFocusedWindow) {
             chrome.sidePanel.open({ windowId: lastFocusedWindow.id });
        }
    });
    chrome.notifications.clear(notificationId);
});
