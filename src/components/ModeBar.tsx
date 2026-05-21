'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LearningMode } from '@/lib/types';
import { HeadphonesIcon, MicIcon, PlayCircleIcon, RepeatIcon, StarFilledIcon } from './Icons';

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

const FAVORITE_HREF = '/favorites';

export default function ModeBar({ mode, onChange }: Props) {
  const pathname = usePathname();
  const favoriteActive = pathname?.startsWith('/favorites') ?? false;

  return (
    <div className="flex gap-1.5 overflow-x-auto py-2 -mx-1 px-1 scrollbar-none md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
      {MODES.map((m) => {
        const active = mode === m.id && !favoriteActive;
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
      <Link
        href={FAVORITE_HREF}
        className={`min-h-[44px] whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border transition cursor-pointer active:scale-[0.97] ${
          favoriteActive ? 'text-white' : ''
        }`}
        style={
          favoriteActive
            ? {
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderColor: 'transparent',
                boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)',
              }
            : {
                background: 'rgba(251, 191, 36, 0.08)',
                borderColor: 'rgba(251, 191, 36, 0.25)',
                color: '#fbbf24',
              }
        }
      >
        <StarFilledIcon className="w-4 h-4" />
        <span className="font-semibold tracking-wide">Favorite</span>
        <span className="text-[11px] opacity-80 hidden sm:inline">お気に入り</span>
      </Link>
    </div>
  );
}
