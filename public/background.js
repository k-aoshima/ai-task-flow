// サイドパネルを開くためのバックグラウンドスクリプト
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

