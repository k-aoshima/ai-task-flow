import React from 'react';
import { TaskCard } from '../components/TaskCard';
import { Task, TabContext, TimerData } from '../types';

export const UsagePage: React.FC = () => {
  // --- Mock Data for Demonstration ---

  // 1. Context Awareness Mock
  const mockTask1: Task = {
    id: 'demo-1',
    name: 'PRレビュー: frontend-feature #123',
    urgency: 4,
    importance: 4,
    estimatedTime: 15,
    contextKey: 'github.com',
    status: 'active',
    isTopPriority: false,
  };

  const mockTabContext: TabContext = {
    title: 'Pull Request #123 - active-coding-app',
    url: 'https://github.com/user/repo/pull/123',
    domain: 'github.com',
  };

  // 2. AI Decomposition Mock
  const mockParentTask: Task = {
    id: 'demo-2',
    name: 'ログイン機能を実装',
    urgency: 3,
    importance: 5,
    estimatedTime: 135,
    contextKey: 'unknown',
    status: 'active',
    isTopPriority: false,
  };

  const mockSubTasks: Task[] = [
    { ...mockParentTask, id: 'demo-2-1', name: 'DBスキーマの設計', estimatedTime: 30, parentTaskName: 'ログイン機能を実装', isChecked: false, urgency: 4, importance: 5 },
    { ...mockParentTask, id: 'demo-2-2', name: 'APIエンドポイント作成', estimatedTime: 45, parentTaskName: 'ログイン機能を実装', isChecked: false, urgency: 3, importance: 4 },
    // { ...mockParentTask, id: 'demo-2-3', name: 'UI実装', estimatedTime: 60, parentTaskName: 'ログイン機能を実装', isChecked: false }, 
  ];

  // 3. Pause Timer Mock
  const mockTimerTask: Task = {
    id: 'demo-3',
    name: 'メール返信',
    urgency: 2,
    importance: 3,
    estimatedTime: 15,
    contextKey: 'gmail.com',
    status: 'active',
    isTopPriority: false,
  };

  const mockTimerData: TimerData = {
    taskId: 'demo-3',
    endTime: Date.now() + 15 * 60 * 1000,
    duration: 15,
    originalTask: mockTimerTask
  };

  // No-operation handlers for static display
  const noop = () => {};

  return (
    <div className="space-y-12 animate-enter pb-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          主な機能と使い方
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          AI TaskFlowは、あなたのコンテキストを理解し、フロー状態を維持するためのインテリジェントなタスクマネージャーです。
        </p>
      </div>

      <div className="grid gap-10">
        {/* Feature 1: Context Awareness */}
        <section className="glass-card p-0 overflow-hidden group shadow-lg dark:border-slate-700">
          <div className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm-3-7c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm7 7h-2.5l-3.5-4.5-3.5 4.5H4v-2l5-6.5V9.08c-.76-.44-1.46-1.07-1.93-1.87-.78-1.31-.69-3 .24-4.23S10 1.5 11.5 1.5c1.45 0 2.76.79 3.51 2.05.51.85.54 1.83.18 2.7l.82 1.05 4.99 6.5V18z"/></svg>
            </div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                  コンテキスト認識による自動提案
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  現在開いているWebページ（GitHub, Slack, JIRAなど）を自動的に検出し、関連するタスクに「AIおすすめ」バッジを表示します。現在のコンテキストに合ったタスクがひと目でわかります。
                </p>
                <ul className="space-y-3">
                   <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                       <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm shadow-emerald-500/50"></span>
                       <span>「おすすめ」バッジで視覚的に強調</span>
                   </li>
                </ul>
              </div>
              
              <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">DEMO</div>
                <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-700 w-fit">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                   Active Tab: <span className="font-bold text-slate-700 dark:text-slate-300">github.com</span>
                </div>
                <div className="pointer-events-none select-none transform scale-100 origin-top">
                    <TaskCard 
                       task={mockTask1}
                       tabContext={mockTabContext}
                       timerData={null}
                       onPause={noop} onDelete={noop} onComplete={noop} onUpdateTime={noop} onUpdateContext={noop} onUpdateName={noop}
                       isSuggested={true}
                       showScore={true}
                    />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2: AI Decomposition */}
        <section className="glass-card p-0 overflow-hidden group shadow-lg dark:border-slate-700">
          <div className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </div>
             <div className="relative z-10 grid md:grid-cols-2 gap-10 items-start">
                <div className="order-2 md:order-1 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">DEMO</div>
                     <div className="space-y-4 pointer-events-none select-none">
                        <div className="text-xs text-slate-500 font-mono mb-2">Input: "<span className="text-slate-800 dark:text-slate-200 font-bold">ログイン機能を実装</span>"</div>
                        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-3">
                            {mockSubTasks.map(t => (
                               <TaskCard key={t.id} task={t} tabContext={null} timerData={null} onPause={noop} onDelete={noop} onComplete={noop} onUpdateTime={noop} onUpdateContext={noop} onUpdateName={noop} onToggleCheck={noop} />
                            ))}
                        </div>
                     </div>
                </div>
                 <div className="order-1 md:order-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                    </div>
                     <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                        AIによるタスク分解・見積もり
                     </h3>
                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        「〜機能を実装する」のような抽象的なゴールも、AIが実行可能な粒度のサブタスクに自動分解。それぞれのタスクの重要度、緊急度、見積もり時間も自動設定されるため、プランニングの手間が省けます。
                     </p>
                     <div className="flex flex-wrap gap-2">
                         <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                            Gemini 1.5 Flash
                         </span>
                         <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            自動グルーピング
                         </span>
                     </div>
                </div>
             </div>
          </div>
        </section>

        {/* Feature 3: Smart Pause Timer */}
        <section className="glass-card p-0 overflow-hidden group shadow-lg dark:border-slate-700">
            <div className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                </div>
                <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                            スマートな保留設定
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                            割り込みが入ったときは、タスクを「保留」状態へ。再開までの時間を設定しておくことで、時間が来たら通知し、タスクへの復帰をサポートします。コンテキストスイッチのコストを最小限に抑えます。
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex -space-x-2">
                                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs">15</span>
                                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs">30</span>
                                <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold">1h</span>
                            </div>
                            <span className="text-xs text-slate-500">ワンクリックで設定</span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">DEMO</div>
                        <div className="pointer-events-none select-none">
                            <TaskCard 
                                task={mockTimerTask}
                                tabContext={null}
                                timerData={mockTimerData}
                                onPause={noop} onDelete={noop} onComplete={noop} onUpdateTime={noop} onUpdateContext={noop} onUpdateName={noop}
                                getRemainingTime={() => ({ minutes: 12, seconds: 30, progress: 16 })}
                                onCancelTimer={noop}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};
