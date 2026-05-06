'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LearningMode, Topic, TopicProgress } from '@/lib/types';
import {
  emptyProgress,
  getBlockProgress,
  loadTopicProgress,
  markMemorized,
  resetProgress,
  unmarkMemorized,
} from '@/lib/storage';
import { isDueForReview, daysSinceReview } from '@/lib/srs';
import BlockCard from '@/components/BlockCard';
import ModeBar from '@/components/ModeBar';
import ProgressIndicator from '@/components/ProgressIndicator';
import ExportImport from '@/components/ExportImport';
import AutoLoopMode from '@/components/AutoLoopMode';

interface Props {
  topic: Topic;
}

export default function TopicView({ topic }: Props) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<LearningMode>('shadowing');
  const [progress, setProgress] = useState<TopicProgress>(() => emptyProgress(topic.fileId));

  useEffect(() => {
    setMounted(true);
    setProgress(loadTopicProgress(topic.fileId));
  }, [topic.fileId]);

  const memorizedCount = useMemo(
    () => Object.values(progress.blocks).filter((b) => b.memorized).length,
    [progress]
  );

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
      />
    ));

  return (
    <main className="max-w-2xl mx-auto px-4 py-3 pb-16">
      <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">
        ← Topics
      </Link>
      <header className="mt-2 mb-3">
        <h1 className="text-xl font-bold">{topic.title}</h1>
        <p className="text-sm text-gray-500">{topic.jaTitle}</p>
      </header>

      <div className="sticky top-0 bg-gray-50 z-10 pb-2 -mx-4 px-4 border-b border-gray-200">
        <ProgressIndicator memorized={memorizedCount} total={topic.blocks.length} />
        <ModeBar mode={mode} onChange={setMode} />
      </div>

      <div className="flex gap-2 mt-3 mb-4 flex-wrap">
        <ExportImport
          topicId={topic.fileId}
          onImported={(p) => setProgress(p)}
        />
        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1 rounded text-xs border border-gray-300 bg-white text-gray-700 hover:border-red-400"
        >
          進捗リセット
        </button>
      </div>

      {!mounted ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : mode === 'autoloop' ? (
        <AutoLoopMode topicSlug={topic.slug} blocks={topic.blocks} />
      ) : mode === 'srs' ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
            「覚えた」してから 1 / 3 / 7 日経ったブロックが復習対象です。
            {dueBlocks.length === 0
              ? ' 今日は復習対象のブロックはありません。'
              : ` 今日は ${dueBlocks.length} ブロックが復習対象です。`}
          </p>
          {dueBlocks.length === 0 ? (
            <details className="bg-white border border-gray-200 rounded p-3">
              <summary className="cursor-pointer text-sm text-gray-600">
                既に覚えた全ブロックの状態を確認
              </summary>
              <ul className="mt-2 space-y-1 text-sm">
                {topic.blocks
                  .filter((b) => getBlockProgress(progress, b.id).memorized)
                  .map((b) => {
                    const bp = getBlockProgress(progress, b.id);
                    return (
                      <li key={b.id} className="text-gray-700">
                        B{String(b.id).padStart(2, '0')} {b.enTitle} —{' '}
                        <span className="text-gray-500">
                          {daysSinceReview(bp)} 日前にレビュー
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </details>
          ) : (
            <div className="space-y-3">{renderBlocks(dueBlocks)}</div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {mode === 'recitation' && (
            <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              暗唱モード: JA を見て EN を口で言ってから、EN ボタンで答え合わせ。
            </p>
          )}
          {renderBlocks(topic.blocks)}
        </div>
      )}
    </main>
  );
}
