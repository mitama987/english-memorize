'use client';

import { useEffect, useState } from 'react';
import { loadTopicProgress } from '@/lib/storage';

interface Props {
  topicId: string;
  total: number;
}

export default function TopicListProgress({ topicId, total }: Props) {
  const [memorized, setMemorized] = useState(0);

  useEffect(() => {
    const p = loadTopicProgress(topicId);
    const count = Object.values(p.blocks).filter((b) => b.memorized).length;
    setMemorized(count);
  }, [topicId]);

  const pct = total === 0 ? 0 : (memorized / total) * 100;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          {memorized} / {total}
        </span>
        <span className="tabular-nums" style={{ color: 'var(--text-faint)' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: memorized > 0 ? 'var(--grad-brand)' : 'transparent',
          }}
        />
      </div>
    </div>
  );
}
