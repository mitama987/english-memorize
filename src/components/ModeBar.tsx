'use client';

import type { LearningMode } from '@/lib/types';
import { HeadphonesIcon, MicIcon, PlayCircleIcon, RepeatIcon } from './Icons';

interface Props {
  mode: LearningMode;
  onChange: (m: LearningMode) => void;
}

const MODES: {
  id: LearningMode;
  label: string;
  jaDesc: string;
  Icon: typeof HeadphonesIcon;
}[] = [
  { id: 'shadowing', label: 'Listen', jaDesc: '判読', Icon: HeadphonesIcon },
  { id: 'recitation', label: 'Recite', jaDesc: '暗唱', Icon: MicIcon },
  { id: 'autoloop', label: 'Loop', jaDesc: '連続再生', Icon: PlayCircleIcon },
  { id: 'srs', label: 'Review', jaDesc: 'ずらし復習', Icon: RepeatIcon },
];

export default function ModeBar({ mode, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto py-2 -mx-1 px-1 scrollbar-none md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
      {MODES.map((m) => {
        const active = mode === m.id;
        const Icon = m.Icon;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`min-h-[44px] whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition cursor-pointer active:scale-[0.97] ${
              active ? 'text-white' : 'text-[var(--text-secondary)]'
            }`}
            style={
              active
                ? {
                    background: 'var(--grad-brand)',
                    borderColor: 'transparent',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                  }
                : {
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'var(--border-subtle)',
                  }
            }
          >
            <Icon className="w-4 h-4" />
            <span className="font-semibold tracking-wide">{m.label}</span>
            <span className="text-[11px] opacity-70 hidden sm:inline">{m.jaDesc}</span>
          </button>
        );
      })}
    </div>
  );
}
