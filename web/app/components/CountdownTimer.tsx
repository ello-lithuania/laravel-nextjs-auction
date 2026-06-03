"use client";

import { useEffect, useState } from "react";

// Gyvas aukciono laikmatis. Skuba = azartas, todėl:
//  - paskutinės 5 min → raudona;
//  - paskutinės 60 s → raudona + pulsavimas.
// Mount-gated: static export prerenderina HTML build metu, todėl laiką
// skaičiuojam tik kliente, kad išvengtume server/client neatitikimo.

type Props = {
  endsAt: string | null;
  className?: string;
};

const pad = (n: number) => n.toString().padStart(2, "0");

function format(seconds: number): string {
  if (seconds <= 0) return "Baigėsi";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${pad(h)}:${pad(m)}`;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export default function CountdownTimer({ endsAt, className = "" }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const target = new Date(endsAt).getTime();
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const ended = secondsLeft !== null && secondsLeft <= 0;
  const urgent = secondsLeft !== null && secondsLeft > 0 && secondsLeft <= 300;
  const critical = secondsLeft !== null && secondsLeft > 0 && secondsLeft <= 60;

  const tone = ended
    ? "bg-ink text-cream"
    : urgent
      ? "bg-red text-white"
      : "bg-ink text-white";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-display font-bold tabular-nums ${tone} ${critical ? "animate-urgent" : ""} ${className}`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
      {secondsLeft === null ? "—:—" : format(secondsLeft)}
    </span>
  );
}
