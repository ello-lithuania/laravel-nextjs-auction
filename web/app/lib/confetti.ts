import confetti from "canvas-confetti";

// Brand confetti — žalia/geltona/raudona/ink. Gerbia „mažiau judesio".
const COLORS = ["#15C46A", "#FFC53D", "#FF4A2E", "#171615"];

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Statymo „pliūpsnis" — nuo elemento (mygtuko) pozicijos arba ekrano apačios.
export function fireBidConfetti(origin?: { x: number; y: number }) {
  if (reduced()) return;
  confetti({
    particleCount: 55,
    spread: 65,
    startVelocity: 38,
    ticks: 120,
    origin: origin ?? { x: 0.5, y: 0.7 },
    colors: COLORS,
    scalar: 0.9,
  });
}

// Laimėjimo šventė — didesnis, iš dviejų pusių.
export function fireWinConfetti() {
  if (reduced()) return;
  const base = { spread: 80, startVelocity: 45, colors: COLORS };
  confetti({ ...base, particleCount: 90, origin: { x: 0.15, y: 0.7 } });
  confetti({ ...base, particleCount: 90, origin: { x: 0.85, y: 0.7 } });
}
