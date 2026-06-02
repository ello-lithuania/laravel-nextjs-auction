"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Laravel Echo wired to a Laravel Reverb websocket server. A single shared
// instance is reused across the app so we don't open one socket per component.

type EchoClient = Echo<"reverb">;

let echoInstance: EchoClient | null = null;

export function getEcho(): EchoClient | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (echoInstance) {
    return echoInstance;
  }

  // pusher-js is the transport Echo's "reverb" broadcaster builds on.
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http";
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080);

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "auction-key",
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "127.0.0.1",
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
  });

  return echoInstance;
}
