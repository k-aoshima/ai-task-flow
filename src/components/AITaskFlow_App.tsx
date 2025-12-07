import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { MainPage } from '../pages/MainPage';
import { SettingsPage } from '../pages/SettingsPage';
import { UsagePage } from '../pages/UsagePage';
import { ToastProvider } from './ToastProvider';

/**
 * MainPageのラッパーコンポーネント
 * カスタマイズトグルをHeaderに渡すために使用
 */
const MainPageWrapper: React.FC = () => {
  const [customizationToggle, setCustomizationToggle] = React.useState<React.ReactNode>(null);

  return (
    <>
      <Header customizationToggle={customizationToggle} />
      <MainPage onCustomizationToggleReady={setCustomizationToggle} />
    </>
  );
};

/**
 * AI TaskFlow アプリケーション
 * 大きなコンテキストを実行可能な優先順位付きサブタスクにAIで自動分解
 */
const AITaskFlowApp: React.FC = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/' || location.pathname === '/main';

  return (
    <ToastProvider>
      <div className="min-h-screen font-sans text-slate-900 dark:text-slate-100 bg-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="p-6">
            {!isMainPage && <Header />}
            <Routes>
              <Route path="/" element={<MainPageWrapper />} />
              <Route path="/main" element={<MainPageWrapper />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/usage" element={<UsagePage />} />
            </Routes>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AITaskFlowApp;
