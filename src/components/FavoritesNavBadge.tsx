'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadFavorites, subscribeFavorites } from '@/lib/favorites';
import { StarFilledIcon } from './Icons';

export default function FavoritesNavBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setCount(loadFavorites().entries.length);
    sync();
    const unsub = subscribeFavorites(sync);
    return unsub;
  }, []);

  return (
    <Link
      href="/favorites"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass transition hover:opacity-90 cursor-pointer"
      style={{ color: '#fbbf24' }}
    >
      <StarFilledIcon className="w-3.5 h-3.5" />
      <span>Favorites</span>
      {count !== null && count > 0 && (
        <span
          className="font-mono text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(251, 191, 36, 0.15)',
            color: '#fbbf24',
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
