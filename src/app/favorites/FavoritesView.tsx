'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Block, FavoritesState, Topic, TopicProgress } from '@/lib/types';
import {
  emptyProgress,
  getBlockProgress,
  loadTopicProgress,
  markMemorized,
  unmarkMemorized,
} from '@/lib/storage';
import {
  clearAllFavorites,
  emptyFavorites,
  loadFavorites,
  subscribeFavorites,
  toggleFavorite,
} from '@/lib/favorites';
import BlockCard from '@/components/BlockCard';
import { ArrowLeftIcon, StarFilledIcon } from '@/components/Icons';

interface Props {
  topics: Topic[];
}

interface ResolvedFavorite {
  topic: Topic;
  block: Block;
}

export default function FavoritesView({ topics }: Props) {
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<FavoritesState>(() => emptyFavorites());
  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});

  const topicById = useMemo(() => {
    const m = new Map<string, Topic>();
    for (const t of topics) m.set(t.fileId, t);
    return m;
  }, [topics]);

  useEffect(() => {
    setMounted(true);
    setFavorites(loadFavorites());
    const unsub = subscribeFavorites(() => setFavorites(loadFavorites()));
    return unsub;
  }, []);

  const resolved: ResolvedFavorite[] = useMemo(() => {
    const list: ResolvedFavorite[] = [];
    for (const e of favorites.entries) {
      const topic = topicById.get(e.topicId);
      if (!topic) continue;
      const block = topic.blocks.find((b) => b.id === e.blockId);
      if (!block) continue;
      list.push({ topic, block });
    }
    return list;
  }, [favorites, topicById]);

  useEffect(() => {
    if (!mounted) return;
    const needed = new Set(resolved.map((r) => r.topic.fileId));
    setProgressMap((prev) => {
      const next: Record<string, TopicProgress> = { ...prev };
      for (const id of needed) {
        if (!next[id]) next[id] = loadTopicProgress(id);
      }
      return next;
    });
  }, [resolved, mounted]);

  const handleToggleMemorized = (topicId: string, blockId: number) => {
    const cur = progressMap[topicId] ?? loadTopicProgress(topicId);
    const bp = getBlockProgress(cur, blockId);
    const updated = bp.memorized
      ? unmarkMemorized(cur, blockId)
      : markMemorized(cur, blockId);
    setProgressMap({ ...progressMap, [topicId]: updated });
  };

  const handleToggleFavorite = (topicId: string, blockId: number) => {
    setFavorites(toggleFavorite(favorites, topicId, blockId));
  };

  const handleClearAll = () => {
    if (!confirm('お気に入りをすべて解除しますか？')) return;
    setFavorites(clearAllFavorites());
  };

  return (
    <main className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-5 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm transition cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Topics
      </Link>

      <header className="mt-3 mb-4 md:mb-5">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 glass"
          style={{ color: '#fbbf24' }}
        >
          <StarFilledIcon className="w-3.5 h-3.5" />
          <span>Favorites</span>
        </div>
        <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl mb-1">
          <span className="text-gradient">お気に入り練習</span>
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
          ★ を付けたブロックだけを集めて、横断で練習。
        </p>
      </header>

      {!mounted ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </p>
      ) : resolved.length === 0 ? (
        <div
          className="rounded-2xl p-6 md:p-8 glass text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <StarFilledIcon
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: 'rgba(251, 191, 36, 0.4)' }}
          />
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            まだお気に入りがありません。
          </p>
          <p className="text-sm">
            トピック詳細の各ブロック右上にある ★ ボタンで追加できます。
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {resolved.length} 件
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              すべて解除
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {resolved.map(({ topic, block }) => {
              const tp = progressMap[topic.fileId] ?? emptyProgress(topic.fileId);
              return (
                <div key={`${topic.fileId}-${block.id}`}>
                  <Link
                    href={`/topics/${topic.fileId}`}
                    className="inline-flex items-center gap-2 mb-1.5 text-xs transition cursor-pointer hover:opacity-80"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    <span
                      className="font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {topic.fileId}
                    </span>
                    {topic.title}
                  </Link>
                  <BlockCard
                    topicSlug={topic.slug}
                    block={block}
                    progress={getBlockProgress(tp, block.id)}
                    onToggleMemorized={() => handleToggleMemorized(topic.fileId, block.id)}
                    showDailyByDefault
                    showJaByDefault={false}
                    isFavorited
                    onToggleFavorite={() => handleToggleFavorite(topic.fileId, block.id)}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
