'use client';

import { useEffect, useRef, useState } from 'react';
import type { Block, Speed } from '@/lib/types';
import { blockAudioPath } from '@/lib/audioPath';

interface Props {
  topicSlug: string;
  blocks: Block[];
}

const LOOP_COUNTS = [1, 3, 5];
const SPEEDS: Speed[] = [1.0, 0.75, 0.5];

export default function AutoLoopMode({ topicSlug, blocks }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loopCount, setLoopCount] = useState(3);
  const [loopRemaining, setLoopRemaining] = useState(3);
  const [speed, setSpeed] = useState<Speed>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setLoopRemaining(loopCount);
  }, [currentIdx, loopCount]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentIdx, speed]);

  if (blocks.length === 0) return <p className="text-gray-500">No blocks</p>;

  const current = blocks[currentIdx];
  const padded = String(current.id).padStart(2, '0');
  const src = blockAudioPath(topicSlug, current.id, current.slug, speed);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (loopRemaining > 1) {
      setLoopRemaining((n) => n - 1);
      audioRef.current?.play().catch(() => {});
    } else if (currentIdx < blocks.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            B{padded}
          </span>
          <h3 className="font-semibold">{current.enTitle}</h3>
          <span className="text-sm text-gray-500">/ {current.jaTitle}</span>
        </div>
        <audio ref={audioRef} src={src} onEnded={handleEnded} controls className="w-full" />
        <p className="text-sm text-gray-600 mt-2">
          残り {loopRemaining} 回 ・ Block {currentIdx + 1} / {blocks.length}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm">繰り返し:</span>
          {LOOP_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLoopCount(n)}
              className={`px-2.5 py-1 rounded text-xs border ${
                loopCount === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {n}回
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm">速度:</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded text-xs border ${
                speed === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={togglePlay}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium"
          >
            {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentIdx(0)}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700"
          >
            ⏮ 最初
          </button>
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 disabled:opacity-50"
          >
            ← 前
          </button>
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.min(blocks.length - 1, i + 1))}
            disabled={currentIdx === blocks.length - 1}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 disabled:opacity-50"
          >
            次 →
          </button>
        </div>
      </div>

      <details className="bg-white rounded-lg border border-gray-200 p-3">
        <summary className="cursor-pointer text-sm text-gray-600">字幕（タップで開く）</summary>
        <div className="mt-2 space-y-2 text-sm">
          {current.sentences.map((s, i) => (
            <div key={i}>
              <p>{s.en}</p>
              <p className="text-gray-500">{s.ja}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
