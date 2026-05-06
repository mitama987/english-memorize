'use client';

import type { LearningMode } from '@/lib/types';

interface Props {
  mode: LearningMode;
  onChange: (m: LearningMode) => void;
}

const MODES: { id: LearningMode; label: string; emoji: string }[] = [
  { id: 'shadowing', label: '判読', emoji: '🎧' },
  { id: 'recitation', label: '暗唱', emoji: '🗣️' },
  { id: 'autoloop', label: '連続再生', emoji: '▶️' },
  { id: 'srs', label: 'ずらし復習', emoji: '🔁' },
];

export default function ModeBar({ mode, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto py-2 -mx-3 px-3 scrollbar-none">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition ${
            mode === m.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          {m.emoji} {m.label}
        </button>
      ))}
    </div>
  );
}
