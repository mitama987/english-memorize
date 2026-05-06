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

  if (memorized === 0) {
    return (
      <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
        0 / {total}
      </span>
    );
  }
  return (
    <span className="inline-block mt-2 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
      {memorized} / {total} 覚えた
    </span>
  );
}
