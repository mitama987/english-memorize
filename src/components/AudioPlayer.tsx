'use client';

import { useEffect, useRef } from 'react';
import type { Speed } from '@/lib/types';

interface Props {
  src: string;
  speed: Speed;
  onSpeedChange: (s: Speed) => void;
  autoplay?: boolean;
  onEnded?: () => void;
}

const SPEEDS: Speed[] = [1.0, 0.75, 0.5];

export default function AudioPlayer({ src, speed, onSpeedChange, autoplay, onEnded }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (autoplay && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [src, autoplay]);

  return (
    <div className="space-y-2">
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={src}
        className="w-full"
        onEnded={onEnded}
      />
      <div className="flex gap-1.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={`px-3 py-1 rounded text-sm border transition ${
              speed === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
