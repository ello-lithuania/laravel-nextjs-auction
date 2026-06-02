"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

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
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-xs rounded-lg px-4 py-3 shadow-lg transition transform ${
              t.type === "success" ? "bg-green-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-slate-800 text-white"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
