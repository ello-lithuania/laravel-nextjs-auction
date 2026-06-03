"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted } from "../lib/sound";

// Garso įjungimo/išjungimo perjungiklis. Mount-gated, kad nebūtų SSR/CSR
// neatitikimo (būsena ateina iš localStorage).
export default function SoundToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [muted, setLocalMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocalMuted(isMuted());
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const next = !muted;
    setLocalMuted(next);
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Įjungti garsą" : "Išjungti garsą"}
      title={muted ? "Įjungti garsą" : "Išjungti garsą"}
      className={`press inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-ink bg-paper text-sm shadow-chunky-sm ${className}`}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
