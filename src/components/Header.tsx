import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  customizationToggle?: React.ReactNode;
}

/**
 * ヘッダーコンポーネント
 */
export const Header: React.FC<HeaderProps> = ({ customizationToggle }) => {
  const location = useLocation();
  const isMain = location.pathname === '/' || location.pathname === '/main';
  const isSettings = location.pathname === '/settings';

  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#c9d1d9] mb-1">
            AI TaskFlow
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e]">
            AIがタスクを分解して管理します
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Link
          to="/"
          className={`p-2 text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] hover:bg-gray-100 dark:hover:bg-[#30363d] rounded-md transition-colors duration-200 ${
            isMain ? 'bg-gray-100 dark:bg-[#30363d]' : ''
          }`}
          title="ホーム"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </Link>
        <Link
          to="/usage"
          className={`p-2 text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] hover:bg-gray-100 dark:hover:bg-[#30363d] rounded-md transition-colors duration-200 ${
            location.pathname === '/usage' ? 'bg-gray-100 dark:bg-[#30363d]' : ''
          }`}
          title="使い方"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </Link>
        <Link
          to="/settings"
          className={`p-2 text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] hover:bg-gray-100 dark:hover:bg-[#30363d] rounded-md transition-colors duration-200 ${
            isSettings ? 'bg-gray-100 dark:bg-[#30363d]' : ''
          }`}
          title="設定"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        {customizationToggle && (
          <>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
            {customizationToggle}
          </>
        )}
      </div>
    </div>
  );
};

