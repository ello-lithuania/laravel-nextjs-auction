// Trumpi „azarto" garsai per Web Audio (be jokių failų). Mute saugomas
// localStorage. Garsas groja tik po vartotojo veiksmo (statymo), todėl
// naršyklės autoplay politikos nepažeidžiamos.

const MUTE_KEY = "dekaukciona_muted";

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

let ctx: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function tone(freq: number, startAt: number, duration: number, peak = 0.18) {
  const c = audioCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const t0 = c.currentTime + startAt;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// „Cha-ching" — du greiti kylantys tonai.
export function playBidSound(): void {
  if (isMuted()) return;
  tone(880, 0, 0.12);
  tone(1320, 0.07, 0.16);
}

// Laimėjimo fanfara — trys kylantys tonai.
export function playWinSound(): void {
  if (isMuted()) return;
  tone(660, 0, 0.16);
  tone(880, 0.12, 0.16);
  tone(1320, 0.26, 0.3, 0.22);
}
