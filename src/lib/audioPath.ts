import type { Speed } from './types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function speedSuffix(speed: Speed): string {
  return speed === 1.0 ? '' : `_${speed}x`;
}

export function blockAudioPath(
  topicSlug: string,
  blockId: number,
  blockSlug: string,
  speed: Speed
): string {
  const padded = String(blockId).padStart(2, '0');
  return `${BASE}/audio/${topicSlug}/b${padded}-${blockSlug}${speedSuffix(speed)}.mp3`;
}

export function fullAudioPath(topicSlug: string, speed: Speed): string {
  return `${BASE}/audio/${topicSlug}${speedSuffix(speed)}.mp3`;
}
