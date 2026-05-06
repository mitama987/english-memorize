'use client';

import { useEffect, useState } from 'react';
import { loadTopicProgress } from '@/lib/storage';
import type { Topic } from '@/lib/types';
import { FlameIcon, LayersIcon, SparklesIcon } from './Icons';

interface Props {
  topics: Topic[];
}

interface Stats {
  totalBlocks: number;
  memorizedBlocks: number;
  topicsTouched: number;
  topicsCompleted: number;
}

function compute(topics: Topic[]): Stats {
  let memorizedBlocks = 0;
  let topicsTouched = 0;
  let topicsCompleted = 0;
  let totalBlocks = 0;

  for (const t of topics) {
    totalBlocks += t.blocks.length;
    const p = loadTopicProgress(t.fileId);
    const memorized = Object.values(p.blocks).filter((b) => b.memorized).length;
    memorizedBlocks += memorized;
    if (memorized > 0) topicsTouched += 1;
    if (memorized === t.blocks.length && t.blocks.length > 0) topicsCompleted += 1;
  }
  return { totalBlocks, memorizedBlocks, topicsTouched, topicsCompleted };
}

export default function StatsHero({ topics }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setStats(compute(topics));
  }, [topics]);

  const pct = stats && stats.totalBlocks > 0 ? (stats.memorizedBlocks / stats.totalBlocks) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        Icon={SparklesIcon}
        label="Memorized"
        value={stats ? stats.memorizedBlocks : 0}
        suffix={` / ${stats?.totalBlocks ?? 0}`}
        accent
      />
      <StatCard
        Icon={LayersIcon}
        label="Topics in progress"
        value={stats ? stats.topicsTouched : 0}
        suffix={` / ${topics.length}`}
      />
      <StatCard
        Icon={FlameIcon}
        label="Completed topics"
        value={stats ? stats.topicsCompleted : 0}
        suffix={` / ${topics.length}`}
      />
      <StatCard
        Icon={SparklesIcon}
        label="Overall"
        value={Math.round(pct)}
        suffix="%"
      />
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  suffix,
  accent = false,
}: {
  Icon: typeof SparklesIcon;
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="relative rounded-xl p-3 md:p-4 glass overflow-hidden"
      style={accent ? { borderColor: 'rgba(217, 70, 239, 0.35)' } : undefined}
    >
      {accent && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'var(--grad-brand-soft)', filter: 'blur(20px)' }}
        />
      )}
      <div className="relative flex items-center gap-2 mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color: accent ? '#d946ef' : 'var(--text-muted)' }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="relative flex items-baseline gap-1">
        <span
          key={value}
          className="tick text-2xl md:text-3xl font-bold tabular-nums heading-display"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm" style={{ color: 'var(--text-faint)' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
