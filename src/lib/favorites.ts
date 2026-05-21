import type { FavoriteEntry, FavoritesState } from './types';

const STORAGE_KEY = 'favorites';
const EVENT_NAME = 'favorites-changed';

export function emptyFavorites(): FavoritesState {
  return { entries: [] };
}

export function loadFavorites(): FavoritesState {
  if (typeof window === 'undefined') return emptyFavorites();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyFavorites();
    const parsed = JSON.parse(raw) as FavoritesState;
    if (!Array.isArray(parsed.entries)) return emptyFavorites();
    return parsed;
  } catch {
    return emptyFavorites();
  }
}

function save(state: FavoritesState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function isFavorite(state: FavoritesState, topicId: string, blockId: number): boolean {
  return state.entries.some((e) => e.topicId === topicId && e.blockId === blockId);
}

export function toggleFavorite(
  state: FavoritesState,
  topicId: string,
  blockId: number
): FavoritesState {
  const exists = isFavorite(state, topicId, blockId);
  const next: FavoritesState = exists
    ? { entries: state.entries.filter((e) => !(e.topicId === topicId && e.blockId === blockId)) }
    : {
        entries: [...state.entries, { topicId, blockId, addedAt: Date.now() } satisfies FavoriteEntry],
      };
  save(next);
  return next;
}

export function removeFavorite(
  state: FavoritesState,
  topicId: string,
  blockId: number
): FavoritesState {
  const next: FavoritesState = {
    entries: state.entries.filter((e) => !(e.topicId === topicId && e.blockId === blockId)),
  };
  save(next);
  return next;
}

export function clearAllFavorites(): FavoritesState {
  const next = emptyFavorites();
  save(next);
  return next;
}

export function subscribeFavorites(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
