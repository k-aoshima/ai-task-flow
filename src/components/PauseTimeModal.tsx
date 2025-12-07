import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PauseTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
  taskName: string;
}

/**
 * 保留時間設定モーダルコンポーネント
 */
export const PauseTimeModal: React.FC<PauseTimeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskName,
}) => {
  const [minutes, setMinutes] = useState<string>('30');
  const [hours, setHours] = useState<string>('0');
  const [enableTimerNotifications, setEnableTimerNotifications] = useLocalStorage('aiTaskFlow_enableTimerNotifications', true);

  // Sync to chrome storage for background script access
  useEffect(() => {
    if ((chrome as any)?.storage?.local) {
      (chrome as any).storage.local.set({ aiTaskFlow_enableTimerNotifications: enableTimerNotifications });
    }
  }, [enableTimerNotifications]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    if (totalMinutes > 0) {
      onConfirm(totalMinutes);
      onClose();
      setMinutes('30');
      setHours('0');
    }
  };

  const handleCancel = () => {
    onClose();
    setMinutes('30');
    setHours('0');
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value) || 0;
      if (numValue >= 0 && numValue < 60) {
        setMinutes(value);
      }
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setHours(value);
    }
  };




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 animate-enter">
      <div className="glass-card max-w-md w-full mx-4 shadow-2xl ring-1 ring-white/40 dark:ring-white/10 p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
          保留時間を設定
        </h2>
        <p className="text-sm font-medium text-rose-500 mb-8 text-center truncate px-4">
          {taskName}
        </p>
        
        <div className="space-y-8">
          {/* Main Time Input */}
          {/* Main Time Input */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
                <button 
                    onClick={() => setHours(Math.min(23, parseInt(hours) + 1).toString())}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                
                <div className="relative">
                    <input
                    type="number"
                    value={hours}
                    onChange={handleHoursChange}
                    min="0"
                    max="23"
                    className="w-24 bg-transparent text-center text-6xl font-black text-slate-800 dark:text-slate-100 focus:outline-none p-0 placeholder-slate-200 leading-none"
                    placeholder="0"
                    />
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Hours</span>
                </div>

                <button 
                    onClick={() => setHours(Math.max(0, parseInt(hours) - 1).toString())}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors mt-4"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            <div className="text-4xl font-light text-slate-300 dark:text-slate-600 pb-8">:</div>

            <div className="flex flex-col items-center gap-2">
                <button 
                    onClick={() => setMinutes(Math.min(59, parseInt(minutes) + 1).toString())}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>

                <div className="relative">
                    <input
                        type="number"
                        value={minutes}
                        onChange={handleMinutesChange}
                        min="0"
                        max="59"
                        className="w-24 bg-transparent text-center text-6xl font-black text-slate-800 dark:text-slate-100 focus:outline-none p-0 placeholder-slate-200 leading-none"
                        placeholder="00"
                    />
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Mins</span>
                </div>

                <button 
                    onClick={() => setMinutes(Math.max(0, parseInt(minutes) - 1).toString())}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors mt-4"
                >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>
          </div>

          {/* Quick Add Presets */}
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 15, 30, 60, 120].map((m) => (
                <button
                    key={m}
                    onClick={() => {
                        setHours(Math.floor(m / 60).toString());
                        setMinutes((m % 60).toString());
                    }}
                    className="py-2 text-sm font-semibold bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-all active:scale-95"
                >
                    +{m >= 60 ? `${m/60}h` : `${m}m`}
                  </button>
            ))}
          </div>

          {/* Timer Options */}
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    完了時の通知
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    ポップアップと音声を有効にする
                </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                type="checkbox" 
                className="sr-only peer"
                checked={enableTimerNotifications}
                onChange={(e) => setEnableTimerNotifications(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 btn-primary py-3 text-base font-bold shadow-lg shadow-blue-500/30"
              disabled={parseInt(hours) * 60 + parseInt(minutes) <= 0}
            >
              設定開始
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

