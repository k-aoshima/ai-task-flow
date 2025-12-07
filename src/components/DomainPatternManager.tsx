import React, { useState } from 'react';
import { DomainPattern } from '../types';

interface DomainPatternManagerProps {
  patterns: DomainPattern[];
  onAdd: (pattern: Omit<DomainPattern, 'id'> & { id?: string }) => void;
  onUpdate: (id: string, updates: Partial<DomainPattern>) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

interface PatternEditFormProps {
  pattern: DomainPattern;
  onSave: (updates: Partial<DomainPattern>) => void;
  onCancel: () => void;
}

/**
 * パターン編集フォーム
 */
const PatternEditForm: React.FC<PatternEditFormProps> = ({ pattern, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: pattern.name || '',
    patterns: pattern.patterns?.join(', ') || '',
    keywords: pattern.keywords?.join(', ') || '',
  });

  const handleSave = () => {
    onSave({
      name: formData.name.trim(),
      patterns: formData.patterns
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p),
      keywords: formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k),
    });
  };

  return (
    <div className="space-y-3 animate-enter">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">パターン名</label>
        <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例: Work"
            className="input-field w-full py-2"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">ドメイン (カンマ区切り)</label>
        <input
            type="text"
            value={formData.patterns}
            onChange={(e) => setFormData({ ...formData, patterns: e.target.value })}
            placeholder="例: slack.com, github.com"
            className="input-field w-full py-2"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">キーワード (カンマ区切り)</label>
        <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="例: IMPORTANT, URGENT"
            className="input-field w-full py-2"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="btn-primary flex-1 py-2 text-sm"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary flex-1 py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

/**
 * ドメインパターン管理コンポーネント
 */
export const DomainPatternManager: React.FC<DomainPatternManagerProps> = ({
  patterns,
  onAdd,
  onUpdate,
  onDelete,
  onReset,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPattern, setNewPattern] = useState({
    name: '',
    patterns: '',
    keywords: '',
  });

  const handleAdd = () => {
    if (!newPattern.name.trim()) return;

    const pattern = {
      name: newPattern.name.trim(),
      patterns: newPattern.patterns
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p),
      keywords: newPattern.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k),
    };

    onAdd(pattern);
    setNewPattern({ name: '', patterns: '', keywords: '' });
  };

  const handleUpdate = (id: string, updates: Partial<DomainPattern>) => {
    onUpdate(id, updates);
    setEditingId(null);
  };

  const startEdit = (pattern: DomainPattern) => {
    setEditingId(pattern.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           ドメインパターン設定
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          デフォルトに戻す
        </button>
      </div>

      {/* 新規追加フォーム */}
      <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            新しいパターンを追加
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
                <input
                    type="text"
                    value={newPattern.name}
                    onChange={(e) => setNewPattern({ ...newPattern, name: e.target.value })}
                    placeholder="パターン名（例: Slack, GitHub）"
                    className="input-field w-full py-2"
                />
            </div>
            <input
                type="text"
                value={newPattern.patterns}
                onChange={(e) => setNewPattern({ ...newPattern, patterns: e.target.value })}
                placeholder="ドメイン (例: slack.com)"
                className="input-field w-full py-2"
            />
            <input
                type="text"
                value={newPattern.keywords}
                onChange={(e) => setNewPattern({ ...newPattern, keywords: e.target.value })}
                placeholder="キーワード (例: chat)"
                className="input-field w-full py-2"
            />
        </div>
        <button
            onClick={handleAdd}
            className="btn-primary w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2"
            disabled={!newPattern.name.trim()}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            パターンを追加
        </button>
      </div>

      {/* 既存パターン一覧 */}
      <div className="space-y-3">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl transition-all hover:shadow-md"
          >
            {editingId === pattern.id ? (
              <PatternEditForm
                pattern={pattern}
                onSave={(updates) => handleUpdate(pattern.id, updates)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {pattern.name}
                    </h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider min-w-[60px]">ドメイン:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded break-all">
                            {pattern.patterns?.join(', ') || 'なし'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider min-w-[60px]">キーワード:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded break-all">
                            {pattern.keywords?.join(', ') || 'なし'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => startEdit(pattern)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="編集"
                    >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button
                      onClick={() => onDelete(pattern.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="削除"
                    >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {patterns.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                パターンが設定されていません
            </div>
        )}
      </div>
    </div>
  );
};

