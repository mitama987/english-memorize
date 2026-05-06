'use client';

import { useEffect, useState } from 'react';
import type { Block, BlockProgress, Speed } from '@/lib/types';
import { blockAudioPath } from '@/lib/audioPath';
import AudioPlayer from './AudioPlayer';

interface Props {
  topicSlug: string;
  block: Block;
  progress: BlockProgress;
  onToggleMemorized: () => void;
  showEnByDefault: boolean;
  showJaByDefault: boolean;
  defaultSpeed?: Speed;
}

export default function BlockCard({
  topicSlug,
  block,
  progress,
  onToggleMemorized,
  showEnByDefault,
  showJaByDefault,
  defaultSpeed = 1.0,
}: Props) {
  const [speed, setSpeed] = useState<Speed>(defaultSpeed);
  const [showEn, setShowEn] = useState(showEnByDefault);
  const [showJa, setShowJa] = useState(showJaByDefault);

  useEffect(() => setShowEn(showEnByDefault), [showEnByDefault]);
  useEffect(() => setShowJa(showJaByDefault), [showJaByDefault]);

  const padded = String(block.id).padStart(2, '0');
  const src = blockAudioPath(topicSlug, block.id, block.slug, speed);

  return (
    <article
      className={`rounded-lg border p-4 md:p-5 transition ${
        progress.memorized ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
      }`}
    >
      <header className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          B{padded}
        </span>
        <h3 className="font-semibold text-base md:text-lg">{block.enTitle}</h3>
        <span className="text-sm md:text-base text-gray-500">/ {block.jaTitle}</span>
      </header>

      <AudioPlayer src={src} speed={speed} onSpeedChange={setSpeed} />

      <div className="my-3 md:my-4 space-y-2 md:space-y-3">
        {block.sentences.map((s, i) => (
          <div
            key={i}
            className="bg-gray-50 rounded px-3 py-2 md:px-4 md:py-3 lg:grid lg:grid-cols-2 lg:gap-4"
          >
            {showEn ? (
              <p className="text-base md:text-lg leading-relaxed">{s.en}</p>
            ) : (
              <p
                className="text-gray-300 italic text-sm select-none cursor-pointer min-h-[44px] flex items-center"
                onClick={() => setShowEn(true)}
              >
                [tap to reveal EN]
              </p>
            )}
            {showJa
              ? s.ja && (
                  <p className="text-sm md:text-base text-gray-600 mt-1 lg:mt-0 lg:border-l lg:pl-4 lg:border-gray-200">
                    {s.ja}
                  </p>
                )
              : s.ja && (
                  <p
                    className="text-gray-300 italic text-xs mt-1 lg:mt-0 lg:border-l lg:pl-4 lg:border-gray-200 select-none cursor-pointer min-h-[32px] flex items-center"
                    onClick={() => setShowJa(true)}
                  >
                    [tap to reveal JA]
                  </p>
                )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-gray-200 gap-2 flex-wrap">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowEn((v) => !v)}
            className={`min-h-[44px] px-3 py-2 rounded text-sm border ${
              showEn
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setShowJa((v) => !v)}
            className={`min-h-[44px] px-3 py-2 rounded text-sm border ${
              showJa
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            JA
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base select-none">
          <input
            type="checkbox"
            checked={progress.memorized}
            onChange={onToggleMemorized}
            className="w-5 h-5 cursor-pointer"
          />
          覚えた
        </label>
      </div>
    </article>
  );
}
