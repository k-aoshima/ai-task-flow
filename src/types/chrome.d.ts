/**
 * Chrome拡張機能の型定義
 */
declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active?: boolean;
    }

    interface TabChangeInfo {
      status?: string;
    }

    interface TabActiveInfo {
      tabId: number;
    }

    function query(
      queryInfo: { active: boolean; currentWindow: boolean }
    ): Promise<Tab[]>;
    function get(tabId: number): Promise<Tab>;
    namespace onUpdated {
      function addListener(
        callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void
      ): void;
      function removeListener(
        callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void
      ): void;
    }
    namespace onActivated {
      function addListener(
        callback: (activeInfo: TabActiveInfo) => void
      ): void;
      function removeListener(
        callback: (activeInfo: TabActiveInfo) => void
      ): void;
    }
  }
}

