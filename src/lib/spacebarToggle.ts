// Spacebar で「最後に触ったプレイヤー」の再生/一時停止をトグルする。
// 同じページに複数の <AudioPlayer /> が並ぶため、active な要素を1つだけ覚えておく。

let activeAudio: HTMLAudioElement | null = null;
let installed = false;

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
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
