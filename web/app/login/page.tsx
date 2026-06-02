"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Prašome užpildyti el. paštą ir slaptažodį.");
      return;
    }
    setLoading(true);
    try {
      // Goes through the same-origin BFF route, which sets the httpOnly auth
      // cookie and returns only the user (never the token).
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Try to parse JSON, but fall back to text for HTML/error pages
      // clone response so we can attempt JSON parse and still read text fallback
      const clone = res.clone();
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        // non-JSON response (HTML error page) — read text from clone
        const txt = await clone.text();
        const snippet = txt.replace(/\s+/g, " ").slice(0, 300);
        const fallbackMsg = `Server returned ${res.status}. ${snippet}`;
        if (!res.ok) throw new Error(fallbackMsg);
      }

      if (!res.ok) {
        const msgFromData =
          typeof data === "object" && data !== null && "message" in data && typeof (data as Record<string, unknown>).message === "string"
            ? ((data as Record<string, unknown>).message as string)
            : undefined;
        const msg = msgFromData ?? `Server error ${res.status}`;
        throw new Error(msg);
      }

      if (data && typeof data === "object" && "user" in data) {
        const parsed = data as {
          user?: { id: number; name: string; email: string; city?: string | null };
        };
        if (parsed.user) {
          login(parsed.user);
        }
      }
      success("Sėkmingai prisijungta");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const userMsg = msg.includes("<!DOCTYPE") || msg.includes("<html") ? "Serverio klaida, pabandykite vėliau." : msg;
      // Show only toast (avoid duplicate inline error)
      toastError(userMsg || "Tinklo klaida");
      // Log a trimmed, sanitized message to the console for debugging
      try {
        const sanitized = String(msg).replace(/\s+/g, " ").slice(0, 400);
        if (process.env.NODE_ENV === "development") console.debug("Login error (truncated):", sanitized);
      } catch {
        if (process.env.NODE_ENV === "development") console.debug("Login error (could not stringify)");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Prisijungimas</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        <label className="block text-sm text-slate-700">
          El. paštas
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
          />
        </label>
        <label className="block text-sm text-slate-700">
          Slaptažodis
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
          />
        </label>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Kraunasi..." : "Prisijungti"}
          </button>
          <a href="/register" className="text-sm text-slate-600 hover:underline">Neturite paskyros? Registracija</a>
        </div>
        <a href="/forgot-password" className="block text-sm text-slate-500 hover:underline">Pamiršote slaptažodį?</a>
      </form>
    </div>
  );
}
