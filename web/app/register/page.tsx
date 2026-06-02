"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Prašome užpildyti visus laukus.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Slaptažodžiai nesutampa.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, city, password, password_confirmation: passwordConfirm }),
      });

      const clone = res.clone();
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
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

      success("Sėkmingai užregistruota — prisijunkite");
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const userMsg = msg.includes("<!DOCTYPE") || msg.includes("<html") ? "Serverio klaida, pabandykite vėliau." : msg;
      // Show only toast (avoid duplicate inline error)
      toastError(userMsg || "Tinklo klaida");
      try {
        const sanitized = String(msg).replace(/\s+/g, " ").slice(0, 400);
        if (process.env.NODE_ENV === "development") console.debug("Register error (truncated):", sanitized);
      } catch {
        if (process.env.NODE_ENV === "development") console.debug("Register error (could not stringify)");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Registracija</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        <label className="block text-sm text-slate-700">
          Vardas
          <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm text-slate-700">
          El. paštas
          <input type="email" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm text-slate-700">
          Miestas
          <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Vilnius" />
        </label>
        <label className="block text-sm text-slate-700">
          Slaptažodis
          <input type="password" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="block text-sm text-slate-700">
          Pakartokite slaptažodį
          <input type="password" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
        </label>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
            {loading ? "Kraunasi..." : "Registruotis"}
          </button>
          <a href="/login" className="text-sm text-slate-600 hover:underline">Jau turite paskyrą? Prisijungti</a>
        </div>
      </form>
    </div>
  );
}
