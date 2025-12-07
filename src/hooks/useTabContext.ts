import { useState, useEffect } from 'react';
import { TabContext } from '../types';

/**
 * 現在のタブ情報を取得するカスタムフック
 */
export const useTabContext = (): TabContext => {
  const [tabContext, setTabContext] = useState<TabContext>({
    url: '',
    title: '',
    domain: '',
  });

  useEffect(() => {
    // Chrome拡張機能のAPIが利用可能かチェック
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const updateTabContext = async () => {
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.url && tab.title) {
            const url = tab.url || '';
            const title = tab.title || '';
            const domain = extractDomain(url);

            setTabContext({ url, title, domain });
          }
        } catch (error) {
          console.error('Failed to get tab context:', error);
          // エラー時は空のコンテキストを設定
          setTabContext({ url: '', title: '', domain: '' });
        }
      };

      // 初回取得
      updateTabContext();

      // タブ変更を監視（ポップアップが開いている間のみ）
      const handleTabUpdate = (
        _tabId: number,
        changeInfo: chrome.tabs.TabChangeInfo,
        tab: chrome.tabs.Tab
      ) => {
        if (changeInfo.status === 'complete' && tab.active) {
          updateTabContext();
        }
      };

      const handleTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
        try {
          const tab = await chrome.tabs.get(activeInfo.tabId);
          if (tab && tab.url && tab.title) {
            const url = tab.url || '';
            const title = tab.title || '';
            const domain = extractDomain(url);
            setTabContext({ url, title, domain });
          }
        } catch (error) {
          console.error('Failed to get tab context on activation:', error);
        }
      };

      chrome.tabs.onUpdated.addListener(handleTabUpdate);
      chrome.tabs.onActivated.addListener(handleTabActivated);

      return () => {
        if (chrome.tabs.onUpdated) {
          chrome.tabs.onUpdated.removeListener(handleTabUpdate);
        }
        if (chrome.tabs.onActivated) {
          chrome.tabs.onActivated.removeListener(handleTabActivated);
        }
      };
    } else {
      // Chrome APIが利用できない場合（開発環境など）
      console.warn('Chrome tabs API is not available');
    }
  }, []);

  return tabContext;
};

/**
 * URLからドメインを抽出
 */
const extractDomain = (url: string): string => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return '';
  }
};

