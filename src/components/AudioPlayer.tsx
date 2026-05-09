'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Speed } from '@/lib/types';
import { clearActiveAudio, setActiveAudio } from '@/lib/spacebarToggle';
import AudioWaveform from './AudioWaveform';
import { PauseIcon, PlayIcon } from './Icons';

interface Props {
  src: string;
  speed: Speed;
  onSpeedChange: (s: Speed) => void;
  autoplay?: boolean;
  onEnded?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  compact?: boolean;
}

const SPEEDS: Speed[] = [1.0, 0.75, 0.5];
const SKIP_SECONDS = 5;

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AudioPlayer({
  src,
  speed,
  onSpeedChange,
  autoplay,
  onEnded,
  onPlayingChange,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(0);
    setDuration(0);
    if (autoplay) {
      audio.play().catch(() => {});
    }
  }, [src, autoplay]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setActiveAudio(audio);
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      clearActiveAudio(audio);
    };
  }, []);

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

  // 矢印キーで±5秒。再生中のプレイヤーだけ反応する。
  useEffect(() => {
    if (!playing) return;
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
  }, [playing, skip]);

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={(e) => {
          setPlaying(true);
          setActiveAudio(e.currentTarget);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => skip(-SKIP_SECONDS)}
          aria-label="5秒戻る"
          className="shrink-0 w-10 h-10 rounded-full grid place-items-center text-xs font-semibold border transition active:scale-95 cursor-pointer"
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
          onClick={toggle}
          aria-label={playing ? '一時停止' : '再生'}
          className="relative shrink-0 w-12 h-12 rounded-full grid place-items-center text-white transition active:scale-95 cursor-pointer"
          style={{
            background: 'var(--grad-brand)',
            boxShadow: playing
              ? '0 0 24px rgba(217, 70, 239, 0.55), 0 0 48px rgba(139, 92, 246, 0.35)'
              : '0 4px 16px rgba(139, 92, 246, 0.35)',
          }}
        >
          {playing ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => skip(SKIP_SECONDS)}
          aria-label="5秒進む"
          className="shrink-0 w-10 h-10 rounded-full grid place-items-center text-xs font-semibold border transition active:scale-95 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          +5s
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <AudioWaveform active={playing} bars={10} className="shrink-0" />
            <div className="flex-1 min-w-0 relative py-2 -my-2">
              <div className="relative h-1.5 rounded-full overflow-hidden bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
                  style={{
                    width: `${pct}%`,
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
          </div>
          <div className="flex justify-between mt-1 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5">
        {SPEEDS.map((s) => {
          const active = speed === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                active ? 'text-white border-transparent' : 'text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }`}
              style={
                active
                  ? { background: 'var(--grad-brand)', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }
                  : { background: 'rgba(255,255,255,0.04)' }
              }
            >
              {s}x
            </button>
          );
        })}
      </div>
    </div>
  );
}
