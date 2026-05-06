'use client';

import { useEffect, useState } from 'react';

interface Props {
  trigger: number; // increment to fire
  count?: number;
  className?: string;
}

const COLORS = ['#8b5cf6', '#d946ef', '#fbbf24', '#34d399', '#38bdf8', '#f472b6'];

export default function ConfettiBurst({ trigger, count = 18, className = '' }: Props) {
  const [particles, setParticles] = useState<
    { id: number; tx: number; ty: number; color: string; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    if (trigger === 0) return;
    const next = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 60;
      return {
        id: trigger * 1000 + i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance - 20,
        color: COLORS[i % COLORS.length],
        size: 5 + Math.random() * 5,
        delay: Math.random() * 60,
      };
    });
    setParticles(next);
    const t = setTimeout(() => setParticles([]), 1100);
    return () => clearTimeout(t);
  }, [trigger, count]);

  if (particles.length === 0) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-visible ${className}`} aria-hidden="true">
      <div className="absolute left-1/2 top-1/2">
        {particles.map((p) => (
          <span
            key={p.id}
            className="confetti-particle"
            style={{
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}ms`,
              ['--tx' as string]: `${p.tx}px`,
              ['--ty' as string]: `${p.ty}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
