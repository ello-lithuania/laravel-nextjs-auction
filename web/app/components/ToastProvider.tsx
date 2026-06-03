"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Toast = { id: string; type: "success" | "error" | "info"; message: string };

type ToastContext = {
  toast: (t: Omit<Toast, "id">) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const Ctx = createContext<ToastContext | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    const toast: Toast = { id, ...t };
    setToasts((s) => [toast, ...s]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4500);
  }, []);

  const ctx = useMemo<ToastContext>(() => ({
    toast: push,
    success: (m: string) => push({ type: "success", message: m }),
    error: (m: string) => push({ type: "error", message: m }),
    info: (m: string) => push({ type: "info", message: m }),
  }), [push]);

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`pointer-events-auto max-w-xs rounded-chunk border-[2.5px] border-ink px-4 py-3 font-semibold shadow-chunky ${
                t.type === "success"
                  ? "bg-green text-white"
                  : t.type === "error"
                    ? "bg-red text-white"
                    : "bg-ink text-cream"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="text-sm">{t.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
