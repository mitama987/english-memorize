// Spacebar で「最後に触ったプレイヤー」の再生/一時停止をトグルする。
// 同じページに複数の <AudioPlayer /> が並ぶため、active な要素を1つだけ覚えておく。

let activeAudio: HTMLAudioElement | null = null;
let installed = false;

// 文字入力系の要素にフォーカスがある時だけ「入力中」とみなす。
// range / checkbox / radio などはスペースで再生トグルさせたいので除外しない。
const TEXT_INPUT_TYPES = new Set([
  'text', 'search', 'email', 'url', 'tel', 'password', 'number', 'date', 'datetime-local', 'month', 'week', 'time',
]);

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type.toLowerCase();
    return TEXT_INPUT_TYPES.has(type);
  }
  return false;
}

function ensureInstalled() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' && e.key !== ' ') return;
    if (e.repeat) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;
    if (!activeAudio) return;
    e.preventDefault();
    if (activeAudio.paused) {
      activeAudio.play().catch(() => {});
    } else {
      activeAudio.pause();
    }
  });
}

export function setActiveAudio(audio: HTMLAudioElement | null) {
  ensureInstalled();
  activeAudio = audio;
}

export function clearActiveAudio(audio: HTMLAudioElement | null) {
  if (activeAudio === audio) activeAudio = null;
}
