import { SparklesIcon } from './Icons';

interface Props {
  memorized: number;
  total: number;
}

export default function ProgressIndicator({ memorized, total }: Props) {
  const pct = total === 0 ? 0 : (memorized / total) * 100;
  const completed = total > 0 && memorized === total;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            <span key={memorized} className="tick">{memorized}</span>
            <span style={{ color: 'var(--text-faint)' }}> / {total}</span>
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>覚えた</span>
          {completed && <SparklesIcon className="w-4 h-4 text-amber-400" />}
        </div>
        <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-faint)' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'var(--grad-brand)',
            boxShadow: '0 0 12px rgba(217, 70, 239, 0.5)',
          }}
        />
      </div>
    </div>
  );
}
