"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Msg = {
  id: number;
  sender_id: number;
  sender_name?: string;
  body: string;
  created_at?: string;
  mine?: boolean;
};

// Privatus pokalbis pirkėjas↔pardavėjas. Žinutės atnaujinamos „polling" būdu
// (kas 4 s), kad veiktų patikimai net be websocket serverio.
export default function ChatPanel({
  token,
  conversationId,
  counterpartName,
  onClose,
}: {
  token: string;
  conversationId: number;
  counterpartName: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/conversations/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (res.ok && active) {
          const data = await res.json();
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [conversationId, token]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) setMessages((m) => [...m, data.message]);
        setBody("");
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-chunk border-[3px] border-ink bg-cream shadow-chunky-lg"
      >
        {/* Antraštė */}
        <div className="flex items-center justify-between border-b-[2.5px] border-ink bg-paper px-4 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Pokalbis su</p>
            <p className="font-display text-lg font-bold leading-none">{counterpartName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti"
            className="press flex h-8 w-8 items-center justify-center rounded-md border-2 border-ink bg-paper font-bold shadow-chunky-sm"
          >
            ✕
          </button>
        </div>

        {/* Žinutės */}
        <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted">
              Dar nėra žinučių. Parašyk pirmas! 👋
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-chunk border-2 border-ink px-3.5 py-2 text-[15px] ${
                    m.mine ? "bg-green text-white" : "bg-paper text-ink"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Įvestis */}
        <form onSubmit={send} className="flex items-center gap-2 border-t-[2.5px] border-ink bg-paper p-3">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Rašyk žinutę…"
            className="min-w-0 flex-1 rounded-md border-2 border-ink bg-cream px-3 py-2.5 text-[15px] outline-none focus:shadow-chunky-sm"
          />
          <button
            type="submit"
            disabled={sending}
            className="press shrink-0 rounded-md border-[2.5px] border-ink bg-green px-4 py-2.5 font-display font-bold text-white shadow-chunky-sm disabled:opacity-60"
          >
            ➤
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
