interface Props {
  active: boolean;
  bars?: number;
  className?: string;
}

export default function AudioWaveform({ active, bars = 12, className = '' }: Props) {
  return (
    <div
      className={`inline-flex items-end gap-[3px] h-6 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className={`waveform-bar ${active ? '' : 'idle'}`} />
      ))}
    </div>
  );
}
