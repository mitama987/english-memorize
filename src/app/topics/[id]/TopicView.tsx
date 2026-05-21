'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { FavoritesState, LearningMode, Topic, TopicProgress } from '@/lib/types';
import {
  emptyProgress,
  getBlockProgress,
  loadTopicProgress,
  markMemorized,
  resetProgress,
  unmarkMemorized,
} from '@/lib/storage';
import {
  emptyFavorites,
  isFavorite,
  loadFavorites,
  subscribeFavorites,
  toggleFavorite,
} from '@/lib/favorites';
import { isDueForReview, daysSinceReview } from '@/lib/srs';
import BlockCard from '@/components/BlockCard';
import ModeBar from '@/components/ModeBar';
import ProgressIndicator from '@/components/ProgressIndicator';
import ExportImport from '@/components/ExportImport';
import AutoLoopMode from '@/components/AutoLoopMode';
import { ArrowLeftIcon, RotateCwIcon } from '@/components/Icons';

interface Props {
  topic: Topic;
}

export default function TopicView({ topic }: Props) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<LearningMode>('shadowing');
  const [progress, setProgress] = useState<TopicProgress>(() => emptyProgress(topic.fileId));
  const [favorites, setFavorites] = useState<FavoritesState>(() => emptyFavorites());

  useEffect(() => {
    setMounted(true);
    setProgress(loadTopicProgress(topic.fileId));
    setFavorites(loadFavorites());
    const unsub = subscribeFavorites(() => setFavorites(loadFavorites()));
    return unsub;
  }, [topic.fileId]);

  const memorizedCount = useMemo(
    () => Object.values(progress.blocks).filter((b) => b.memorized).length,
    [progress]
  );

  const handleToggleFavorite = (blockId: number) => {
    setFavorites(toggleFavorite(favorites, topic.fileId, blockId));
  };

  const handleToggleMemorized = (blockId: number) => {
    const cur = getBlockProgress(progress, blockId);
    setProgress(
      cur.memorized ? unmarkMemorized(progress, blockId) : markMemorized(progress, blockId)
    );
  };

  const handleReset = () => {
    if (!confirm('このトピックの進捗をリセットしますか？')) return;
    setProgress(resetProgress(topic.fileId));
  };

  const dueBlocks = useMemo(
    () => topic.blocks.filter((b) => isDueForReview(getBlockProgress(progress, b.id))),
    [topic.blocks, progress]
  );

  const showEnByDefault = mode !== 'recitation';
  const showJaByDefault = mode === 'recitation';

  const renderBlocks = (blocks: typeof topic.blocks) =>
    blocks.map((block) => (
      <BlockCard
        key={`${mode}-${block.id}`}
        topicSlug={topic.slug}
        block={block}
        progress={getBlockProgress(progress, block.id)}
        onToggleMemorized={() => handleToggleMemorized(block.id)}
        showEnByDefault={showEnByDefault}
        showJaByDefault={showJaByDefault}
        isFavorited={isFavorite(favorites, topic.fileId, block.id)}
        onToggleFavorite={() => handleToggleFavorite(block.id)}
      />
    ));

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
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-md"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
            }}
          >
            {topic.fileId}
          </span>
        </div>
        <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl mb-1">
          <span className="text-gradient">{topic.title}</span>
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
          {topic.jaTitle}
        </p>
      </header>

      <div
        className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 backdrop-blur-xl"
        style={{
          background: 'rgba(10, 10, 20, 0.7)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <ProgressIndicator memorized={memorizedCount} total={topic.blocks.length} />
        <div className="mt-2">
          <ModeBar mode={mode} onChange={setMode} />
        </div>
      </div>

      <div className="flex gap-2 mt-4 mb-5 flex-wrap items-center">
        <ExportImport topicId={topic.fileId} onImported={(p) => setProgress(p)} />
        <button
          type="button"
          onClick={handleReset}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <RotateCwIcon className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {!mounted ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading...
        </p>
      ) : mode === 'autoloop' ? (
        <AutoLoopMode topicSlug={topic.slug} blocks={topic.blocks} />
      ) : mode === 'srs' ? (
        <div className="space-y-3 md:space-y-4">
          <p
            className="text-sm md:text-base rounded-xl px-4 py-3 glass"
            style={{
              background: 'var(--grad-brand-soft)',
              borderColor: 'rgba(139, 92, 246, 0.25)',
              color: 'var(--text-secondary)',
            }}
          >
            「覚えた」してから 1 / 3 / 7 日後に自動表示。
            {dueBlocks.length === 0
              ? ' 今日の復習対象はありません。'
              : ` 今日 ${dueBlocks.length} ブロックが復習対象。`}
          </p>
          {dueBlocks.length === 0 ? (
            <details className="rounded-xl p-4 glass">
              <summary
                className="cursor-pointer text-sm md:text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                覚えた全ブロックの状態を確認
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm md:text-base">
                {topic.blocks
                  .filter((b) => getBlockProgress(progress, b.id).memorized)
                  .map((b) => {
                    const bp = getBlockProgress(progress, b.id);
                    return (
                      <li key={b.id} style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>
                          B{String(b.id).padStart(2, '0')}
                        </span>
                        {b.enTitle} —{' '}
                        <span style={{ color: 'var(--text-faint)' }}>
                          {daysSinceReview(bp)} 日前
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </details>
          ) : (
            <div className="space-y-3 md:space-y-4">{renderBlocks(dueBlocks)}</div>
          )}
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {mode === 'recitation' && (
            <p
              className="text-sm md:text-base rounded-xl px-4 py-3 glass"
              style={{
                background: 'rgba(251, 191, 36, 0.08)',
                borderColor: 'rgba(251, 191, 36, 0.25)',
                color: 'var(--text-secondary)',
              }}
            >
              暗唱モード — JA を見て EN を口で言う → EN ボタンで答え合わせ。
            </p>
          )}
          {renderBlocks(topic.blocks)}
        </div>
      )}
    </main>
  );
}
