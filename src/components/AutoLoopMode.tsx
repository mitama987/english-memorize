'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Block, Speed } from '@/lib/types';
import { blockAudioPath } from '@/lib/audioPath';
import { clearActiveAudio, setActiveAudio } from '@/lib/spacebarToggle';
import AudioWaveform from './AudioWaveform';
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  RotateCwIcon,
} from './Icons';

interface Props {
  topicSlug: string;
  blocks: Block[];
}

const LOOP_COUNTS = [1, 3, 5];
const SPEEDS: Speed[] = [1.0, 0.75, 0.5];
const SKIP_SECONDS = 5;

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AutoLoopMode({ topicSlug, blocks }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loopCount, setLoopCount] = useState(3);
  const [loopRemaining, setLoopRemaining] = useState(3);
  const [speed, setSpeed] = useState<Speed>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setLoopRemaining(loopCount);
  }, [currentIdx, loopCount]);

  useEffect(() => {
    setCurrent(0);
    setDuration(0);
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentIdx, speed]);

  const seekTo = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = Number.isFinite(audio.duration) ? audio.duration : 0;
    const upper = max > 0 ? max : t;
    const clamped = Math.max(0, Math.min(upper, t));
    audio.currentTime = clamped;
    setCurrent(clamped);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo(audio.currentTime + delta);
    },
    [seekTo]
  );

  // 矢印キーで±5秒（再生中のみ）
  useEffect(() => {
    if (!isPlaying) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip(-SKIP_SECONDS);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skip(SKIP_SECONDS);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, skip]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      clearActiveAudio(audio);
    };
  }, []);

  if (blocks.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No blocks</p>;

  const current_block = blocks[currentIdx];
  const padded = String(current_block.id).padStart(2, '0');
  const src = blockAudioPath(topicSlug, current_block.id, current_block.slug, speed);
  const totalProgress = ((currentIdx + (loopCount - loopRemaining + 1) / loopCount) / blocks.length) * 100;
  const blockPct = duration > 0 ? (current / duration) * 100 : 0;

  const togglePlay = () => {
    if (!audioRef.current) return;
    setActiveAudio(audioRef.current);
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
    <div className="space-y-4 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:space-y-0 lg:items-start">
      <div className="space-y-4">
        <div
          className={`relative rounded-2xl p-5 md:p-7 glass overflow-hidden transition ${
            isPlaying ? 'glow-brand' : ''
          }`}
          style={isPlaying ? { borderColor: 'rgba(217, 70, 239, 0.4)' } : undefined}
        >
          {isPlaying && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(60% 80% at 50% 0%, rgba(217, 70, 239, 0.15), transparent 70%)',
              }}
            />
          )}
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-secondary)',
                }}
              >
                B{padded}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--text-faint)' }}
              >
                {currentIdx + 1} / {blocks.length}
              </span>
              <AudioWaveform active={isPlaying} bars={6} className="ml-auto" />
            </div>

            <h3
              className="heading-display text-2xl md:text-3xl mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {current_block.enTitle}
            </h3>
            <p className="text-sm md:text-base mb-4" style={{ color: 'var(--text-muted)' }}>
              {current_block.jaTitle}
            </p>

            <audio
              ref={audioRef}
              src={src}
              onPlay={(e) => setActiveAudio(e.currentTarget)}
              onEnded={handleEnded}
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              preload="metadata"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => skip(-SKIP_SECONDS)}
                aria-label="5秒戻る"
                className="shrink-0 w-11 h-11 rounded-full grid place-items-center text-xs font-semibold border transition active:scale-95 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                −5s
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? '一時停止' : '再生'}
                className="relative shrink-0 w-14 h-14 rounded-full grid place-items-center text-white transition active:scale-95 cursor-pointer"
                style={{
                  background: 'var(--grad-brand)',
                  boxShadow: isPlaying
                    ? '0 0 32px rgba(217, 70, 239, 0.6), 0 0 64px rgba(139, 92, 246, 0.35)'
                    : '0 4px 20px rgba(139, 92, 246, 0.45)',
                }}
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => skip(SKIP_SECONDS)}
                aria-label="5秒進む"
                className="shrink-0 w-11 h-11 rounded-full grid place-items-center text-xs font-semibold border transition active:scale-95 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                +5s
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-xs mb-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                  Loop {loopCount - loopRemaining + 1} / {loopCount} · Block {currentIdx + 1} / {blocks.length}
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${totalProgress}%`,
                      background: 'var(--grad-brand)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative py-2 -my-2">
                <div className="relative h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
                    style={{
                      width: `${blockPct}%`,
                      background: 'var(--grad-brand)',
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.05}
                  value={current}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="再生位置"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
                />
              </div>
              <div className="flex justify-between mt-1 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>{fmt(current)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        <details className="rounded-xl p-4 glass">
          <summary
            className="cursor-pointer text-sm md:text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            字幕を見る
          </summary>
          <div className="mt-3 space-y-3 text-sm md:text-base">
            {current_block.sentences.map((s, i) => (
              <div key={i} className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ color: 'var(--text-primary)' }}>{s.en}</p>
                <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                  {s.ja}
                </p>
              </div>
            ))}
          </div>
        </details>
      </div>

      <aside className="rounded-2xl p-4 md:p-5 glass space-y-4 lg:sticky lg:top-32 lg:h-fit">
        <Section label="繰り返し">
          {LOOP_COUNTS.map((n) => (
            <PillButton key={n} active={loopCount === n} onClick={() => setLoopCount(n)}>
              {n}回
            </PillButton>
          ))}
        </Section>
        <Section label="速度">
          {SPEEDS.map((s) => (
            <PillButton key={s} active={speed === s} onClick={() => setSpeed(s)}>
              {s}x
            </PillButton>
          ))}
        </Section>

        <div className="grid grid-cols-3 gap-2">
          <NavButton
            onClick={() => setCurrentIdx(0)}
            disabled={currentIdx === 0}
            label="最初"
            Icon={RotateCwIcon}
          />
          <NavButton
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            label="前"
            Icon={SkipBackIcon}
          />
          <NavButton
            onClick={() => setCurrentIdx((i) => Math.min(blocks.length - 1, i + 1))}
            disabled={currentIdx === blocks.length - 1}
            label="次"
            Icon={SkipForwardIcon}
          />
        </div>
      </aside>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="text-[11px] uppercase tracking-wider mb-2 font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-medium border transition cursor-pointer"
      style={
        active
          ? {
              background: 'var(--grad-brand)',
              color: 'white',
              borderColor: 'transparent',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
            }
          : {
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-subtle)',
            }
      }
    >
      {children}
    </button>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  Icon,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  Icon: typeof RotateCwIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-[44px] inline-flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg text-xs font-medium border transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
