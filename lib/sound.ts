// Короткий звук уведомления через Web Audio API — без аудиофайла.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/**
 * Разблокирует аудиоконтекст — браузеры запускают звук только после действия
 * пользователя. Вызывается один раз на первый клик/тач.
 */
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

/** Проигрывает двухнотный «динь». Best-effort: молча выходит при любой ошибке. */
export function playNotificationSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  try {
    const now = c.currentTime;
    [880, 1175].forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // намеренно игнорируем
  }
}
