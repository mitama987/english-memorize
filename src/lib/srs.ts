import type { BlockProgress } from './types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_OFFSETS_DAYS = [1, 3, 7];

export function isDueForReview(progress: BlockProgress, now = Date.now()): boolean {
  if (!progress.memorized || progress.lastReviewedAt === 0) return false;
  const elapsedDays = (now - progress.lastReviewedAt) / ONE_DAY_MS;
  return REVIEW_OFFSETS_DAYS.some(
    (offset) => elapsedDays >= offset - 0.5 && elapsedDays <= offset + 0.5
  );
}

export function nextReviewDay(progress: BlockProgress, now = Date.now()): number | null {
  if (!progress.memorized || progress.lastReviewedAt === 0) return null;
  const elapsedDays = (now - progress.lastReviewedAt) / ONE_DAY_MS;
  for (const offset of REVIEW_OFFSETS_DAYS) {
    if (elapsedDays < offset - 0.5) return offset;
  }
  return null;
}

export function daysSinceReview(progress: BlockProgress, now = Date.now()): number {
  if (progress.lastReviewedAt === 0) return Infinity;
  return Math.floor((now - progress.lastReviewedAt) / ONE_DAY_MS);
}
