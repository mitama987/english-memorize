import type { BlockProgress, TopicProgress } from './types';

const STORAGE_PREFIX = 'progress-';

function key(topicId: string): string {
  return `${STORAGE_PREFIX}${topicId}`;
}

export function loadTopicProgress(topicId: string): TopicProgress {
  if (typeof window === 'undefined') {
    return emptyProgress(topicId);
  }
  try {
    const raw = window.localStorage.getItem(key(topicId));
    if (!raw) return emptyProgress(topicId);
    const parsed = JSON.parse(raw) as TopicProgress;
    if (!parsed.blocks) parsed.blocks = {};
    return parsed;
  } catch {
    return emptyProgress(topicId);
  }
}

export function saveTopicProgress(progress: TopicProgress): void {
  if (typeof window === 'undefined') return;
  progress.updatedAt = Date.now();
  window.localStorage.setItem(key(progress.topicId), JSON.stringify(progress));
}

export function emptyProgress(topicId: string): TopicProgress {
  return { topicId, blocks: {}, updatedAt: 0 };
}

export function getBlockProgress(progress: TopicProgress, blockId: number): BlockProgress {
  return (
    progress.blocks[blockId] ?? {
      memorized: false,
      lastReviewedAt: 0,
      reviewCount: 0,
    }
  );
}

export function updateBlockProgress(
  progress: TopicProgress,
  blockId: number,
  patch: Partial<BlockProgress>
): TopicProgress {
  const current = getBlockProgress(progress, blockId);
  const next: TopicProgress = {
    ...progress,
    blocks: { ...progress.blocks, [blockId]: { ...current, ...patch } },
  };
  saveTopicProgress(next);
  return next;
}

export function markMemorized(progress: TopicProgress, blockId: number): TopicProgress {
  return updateBlockProgress(progress, blockId, {
    memorized: true,
    lastReviewedAt: Date.now(),
    reviewCount: getBlockProgress(progress, blockId).reviewCount + 1,
  });
}

export function unmarkMemorized(progress: TopicProgress, blockId: number): TopicProgress {
  return updateBlockProgress(progress, blockId, { memorized: false });
}

export function resetProgress(topicId: string): TopicProgress {
  const fresh = emptyProgress(topicId);
  saveTopicProgress(fresh);
  return fresh;
}

export function exportProgress(progress: TopicProgress): string {
  return JSON.stringify(progress, null, 2);
}

export function importProgress(json: string): TopicProgress | null {
  try {
    const parsed = JSON.parse(json) as TopicProgress;
    if (!parsed.topicId || !parsed.blocks) return null;
    saveTopicProgress(parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function downloadJson(filename: string, content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
