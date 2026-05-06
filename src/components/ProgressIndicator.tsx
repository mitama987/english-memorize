interface Props {
  memorized: number;
  total: number;
}

export default function ProgressIndicator({ memorized, total }: Props) {
  const pct = total === 0 ? 0 : (memorized / total) * 100;
  return (
    <div className="space-y-1">
      <div className="h-1.5 md:h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs md:text-sm text-gray-600">
        {memorized} / {total} 覚えた
      </p>
    </div>
  );
}
