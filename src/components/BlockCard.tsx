'use client';

import { useEffect, useRef, useState } from 'react';
import type { Block, BlockProgress, Speed } from '@/lib/types';
import { blockAudioPath } from '@/lib/audioPath';
import AudioPlayer from './AudioPlayer';
import ConfettiBurst from './ConfettiBurst';
import { CheckIcon, StarIcon, StarFilledIcon } from './Icons';

interface Props {
  topicSlug: string;
  block: Block;
  progress: BlockProgress;
  onToggleMemorized: () => void;
  showEnByDefault: boolean;
  showJaByDefault: boolean;
  defaultSpeed?: Speed;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export default function BlockCard({
  topicSlug,
  block,
  progress,
  onToggleMemorized,
  showEnByDefault,
  showJaByDefault,
  defaultSpeed = 1.0,
  isFavorited = false,
  onToggleFavorite,
}: Props) {
  const [speed, setSpeed] = useState<Speed>(defaultSpeed);
  const [showEn, setShowEn] = useState(showEnByDefault);
  const [showJa, setShowJa] = useState(showJaByDefault);
  const [showSimple, setShowSimple] = useState(false);
  const hasAnySimple = block.sentences.some((s) => s.enSimple);
  const [playing, setPlaying] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevMemorized = useRef(progress.memorized);

  useEffect(() => setShowEn(showEnByDefault), [showEnByDefault]);
  useEffect(() => setShowJa(showJaByDefault), [showJaByDefault]);

  useEffect(() => {
    if (!prevMemorized.current && progress.memorized) {
      setConfettiTrigger((t) => t + 1);
    }
    prevMemorized.current = progress.memorized;
  }, [progress.memorized]);

  const padded = String(block.id).padStart(2, '0');
  const src = blockAudioPath(topicSlug, block.id, block.slug, speed);

  return (
    <article
      className={`relative rounded-2xl p-4 md:p-5 transition-all glass ${
        progress.memorized ? 'glow-success' : ''
      } ${playing ? 'glow-brand' : ''}`}
      style={{
        borderColor: progress.memorized
          ? 'rgba(52, 211, 153, 0.4)'
          : playing
          ? 'rgba(217, 70, 239, 0.35)'
          : undefined,
      }}
    >
      <ConfettiBurst trigger={confettiTrigger} />

      <header className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-md transition ${
            progress.memorized ? 'text-emerald-300' : ''
          }`}
          style={{
            background: progress.memorized
              ? 'rgba(52, 211, 153, 0.12)'
              : 'rgba(255, 255, 255, 0.06)',
            color: progress.memorized ? '#34d399' : 'var(--text-muted)',
          }}
        >
          B{padded}
        </span>
        <h3 className="font-semibold text-base md:text-lg flex-1 min-w-0" style={{ color: 'var(--text-primary)' }}>
          {block.enTitle}
        </h3>
        {progress.memorized && (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
            }}
          >
            <CheckIcon className="w-3 h-3" />
            覚えた
          </span>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorited}
            aria-label={isFavorited ? 'お気に入りから外す' : 'お気に入りに追加'}
            className="grid place-items-center w-9 h-9 rounded-full transition active:scale-95 cursor-pointer"
            style={
              isFavorited
                ? {
                    background: 'rgba(251, 191, 36, 0.15)',
                    color: '#fbbf24',
                  }
                : {
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-faint)',
                    border: '1px solid var(--border-subtle)',
                  }
            }
          >
            {isFavorited ? (
              <StarFilledIcon className="w-4 h-4" />
            ) : (
              <StarIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </header>

      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        {block.jaTitle}
      </p>

      <AudioPlayer
        src={src}
        speed={speed}
        onSpeedChange={setSpeed}
        onPlayingChange={setPlaying}
      />

      <div className="my-4 space-y-2 md:space-y-3">
        {block.sentences.map((s, i) => (
          <div
            key={i}
            className="rounded-xl px-3 py-3 md:px-4 md:py-3 transition"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {showEn ? (
              <p
                className="text-base md:text-lg leading-relaxed font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {s.en}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShowEn(true)}
                className="w-full text-left italic text-sm min-h-[44px] flex items-center transition hover:opacity-100 cursor-pointer"
                style={{ color: 'var(--text-faint)' }}
              >
                tap to reveal English →
              </button>
            )}
            {showSimple && s.enSimple && (
              <p
                className="text-sm md:text-base mt-1.5 leading-relaxed italic"
                style={{ color: 'var(--text-muted)' }}
              >
                <span
                  className="font-mono text-[10px] tracking-wider mr-2 px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(251, 191, 36, 0.12)',
                    color: '#fbbf24',
                    fontStyle: 'normal',
                  }}
                >
                  DAILY
                </span>
                {s.enSimple}
              </p>
            )}
            {showJa
              ? s.ja && (
                  <p
                    className="text-sm md:text-base mt-2 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {s.ja}
                  </p>
                )
              : s.ja && (
                  <button
                    type="button"
                    onClick={() => setShowJa(true)}
                    className="w-full text-left italic text-xs mt-2 min-h-[32px] flex items-center transition cursor-pointer"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    tap to reveal 日本語 →
                  </button>
                )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 gap-2 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-1.5 flex-wrap">
          <ToggleChip label="EN" active={showEn} onClick={() => setShowEn((v) => !v)} />
          <ToggleChip label="JA" active={showJa} onClick={() => setShowJa((v) => !v)} />
          {hasAnySimple && (
            <ToggleChip
              label="Daily"
              active={showSimple}
              onClick={() => setShowSimple((v) => !v)}
            />
          )}
        </div>
        <button
          type="button"
          onClick={onToggleMemorized}
          aria-pressed={progress.memorized}
          className={`relative min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition active:scale-95 cursor-pointer ${
            progress.memorized ? 'text-emerald-50' : 'text-[var(--text-secondary)]'
          }`}
          style={
            progress.memorized
              ? {
                  background: 'var(--grad-success)',
                  boxShadow: '0 4px 16px rgba(52, 211, 153, 0.4)',
                }
              : {
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                }
          }
        >
          <span
            className={`grid place-items-center w-5 h-5 rounded-full transition ${
              progress.memorized ? 'bg-white/20' : 'bg-white/5'
            }`}
          >
            {progress.memorized && <CheckIcon className="w-3 h-3" />}
          </span>
          {progress.memorized ? '覚えた!' : '覚えたら押す'}
        </button>
      </div>
    </article>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-medium border transition cursor-pointer`}
      style={
        active
          ? {
              background: 'var(--grad-brand)',
              color: 'white',
              borderColor: 'transparent',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
            }
          : {
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-subtle)',
            }
      }
    >
      {label}
    </button>
  );
}
