"use client";

import { useEffect, useState } from "react";
import { useToast } from "./ToastProvider";

// Dalijimosi mygtukai (FB, X, WhatsApp, LinkedIn + kopijuoti nuorodą).
// URL paimamas iš naršyklės kliento pusėje, todėl veikia ir static export.

export default function ShareButtons({
  title,
  label = "Pasidalink:",
}: {
  title: string;
  label?: string;
}) {
  const [url, setUrl] = useState("");
  const toast = useToast();

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const enc = encodeURIComponent;
  const open = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer,width=620,height=540");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      toast.success("Nuoroda nukopijuota! 🔗");
    } catch {
      toast.error("Nepavyko nukopijuoti nuorodos");
    }
  };

  const targets = [
    {
      name: "Facebook",
      bg: "bg-[#1877F2]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      icon: (
        <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v1H9v3h2v6h3v-6h2l1-3h-3V9c0-.6.4-1 1-1z" />
      ),
    },
    {
      name: "X",
      bg: "bg-ink",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
      icon: (
        <path d="M4 4l7 8.5L4.5 20H7l5-5.7L16 20h4l-7.3-8.9L19.5 4H17l-4.6 5.3L8 4H4z" />
      ),
    },
    {
      name: "WhatsApp",
      bg: "bg-[#25D366]",
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
      icon: (
        <path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 11-3.7 12.9l-.3-.2-2.3.6.6-2.2-.2-.3A7 7 0 0112 5zm-2.5 3c-.2 0-.5.1-.7.4-.3.3-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.6 4 3.5 2 .8 2.4.7 2.8.6.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2.1-1.5-.2-.3 0-.4.1-.6l.4-.5c.1-.2 0-.4 0-.5l-.7-1.6c-.1-.3-.3-.3-.4-.3h-.3z" />
      ),
    },
    {
      name: "LinkedIn",
      bg: "bg-[#0A66C2]",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      icon: (
        <path d="M7 9v8H4V9h3zM5.5 4.5A1.5 1.5 0 115.5 7.5a1.5 1.5 0 010-3zM20 17h-3v-4.3c0-1.2-.5-1.7-1.3-1.7-.8 0-1.4.5-1.4 1.7V17h-3V9h3v1.1c.4-.7 1.3-1.3 2.5-1.3 1.9 0 3.2 1.2 3.2 3.8V17z" />
      ),
    },
  ];

  return (
    <div>
      <span className="mb-2.5 block text-sm font-bold">{label}</span>
      <div className="flex flex-wrap items-center gap-2.5">
        {targets.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => open(t.href)}
          aria-label={`Dalintis: ${t.name}`}
          title={t.name}
          className={`press flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink text-white shadow-chunky-sm ${t.bg}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {t.icon}
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Kopijuoti nuorodą"
        title="Kopijuoti nuorodą"
        className="press flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink bg-paper shadow-chunky-sm"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
          <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
        </svg>
      </button>
      </div>
    </div>
  );
}
