"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastProvider";
import AuthShell, { inputClass, labelClass, primaryBtnClass } from "../components/AuthShell";

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
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
      const res = await fetch(`${apiBase}/api/register`, {
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
    <AuthShell title="Susikurk paskyrą" subtitle="Nemokamai. Statyk, parduok ir laimėk realiu laiku.">
      <form onSubmit={submit} className="space-y-4">
        {error ? (
          <div className="rounded-md border-2 border-ink bg-red px-3 py-2 text-sm font-semibold text-white">
            {error}
          </div>
        ) : null}
        <div>
          <label className={labelClass}>Vardas</label>
          <input className={`mt-1.5 ${inputClass}`} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>El. paštas</label>
          <input type="email" className={`mt-1.5 ${inputClass}`} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Miestas</label>
          <input className={`mt-1.5 ${inputClass}`} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Vilnius" />
        </div>
        <div>
          <label className={labelClass}>Slaptažodis</label>
          <input type="password" className={`mt-1.5 ${inputClass}`} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Pakartok slaptažodį</label>
          <input type="password" className={`mt-1.5 ${inputClass}`} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className={primaryBtnClass}>
          {loading ? "Kuriama…" : "Registruotis 🎉"}
        </button>
        <p className="pt-1 text-center text-sm">
          <span className="text-muted">Jau turi paskyrą? </span>
          <Link href="/login" className="font-semibold text-green-deep hover:underline">
            Prisijunk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
