import type { Speed } from './types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export type AudioVariant = 'long' | 'daily';

function speedSuffix(speed: Speed): string {
  return speed === 1.0 ? '' : `_${speed}x`;
}

function variantDir(variant: AudioVariant): string {
  return variant === 'daily' ? 'audio-daily' : 'audio';
}

export function blockAudioPath(
  topicSlug: string,
  blockId: number,
  blockSlug: string,
  speed: Speed,
  variant: AudioVariant = 'long'
): string {
  const padded = String(blockId).padStart(2, '0');
  return `${BASE}/${variantDir(variant)}/${topicSlug}/b${padded}-${blockSlug}${speedSuffix(speed)}.mp3`;
}

export function fullAudioPath(topicSlug: string, speed: Speed): string {
  return `${BASE}/audio/${topicSlug}${speedSuffix(speed)}.mp3`;
}
