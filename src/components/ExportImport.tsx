'use client';

import { useRef } from 'react';
import {
  downloadJson,
  exportProgress,
  importProgress,
  loadTopicProgress,
} from '@/lib/storage';
import type { TopicProgress } from '@/lib/types';
import { DownloadIcon, UploadIcon } from './Icons';

interface Props {
  topicId: string;
  onImported: (p: TopicProgress) => void;
}

export default function ExportImport({ topicId, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const p = loadTopicProgress(topicId);
    const today = new Date().toISOString().slice(0, 10);
    downloadJson(`progress-${topicId}-${today}.json`, exportProgress(p));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importProgress(text);
    if (result) {
      onImported(result);
      alert('インポート完了');
    } else {
      alert('インポート失敗: 不正なJSON形式');
    }
    e.target.value = '';
  };

  const baseClass =
    'min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer';
  const baseStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'var(--border-subtle)',
    color: 'var(--text-secondary)',
  };

  return (
    <>
      <button type="button" onClick={handleExport} className={baseClass} style={baseStyle}>
        <DownloadIcon className="w-3.5 h-3.5" />
        Export
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={baseClass}
        style={baseStyle}
      >
        <UploadIcon className="w-3.5 h-3.5" />
        Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}
