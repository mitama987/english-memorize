'use client';

import { useRef } from 'react';
import {
  downloadJson,
  exportProgress,
  importProgress,
  loadTopicProgress,
} from '@/lib/storage';
import type { TopicProgress } from '@/lib/types';

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

  return (
    <>
      <button
        type="button"
        onClick={handleExport}
        className="min-h-[44px] px-3 py-2 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:border-blue-400"
      >
        Export
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="min-h-[44px] px-3 py-2 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:border-blue-400"
      >
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
