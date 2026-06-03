"use client"

import { useState } from "react";
import Link from "next/link";
import { useToast } from "../components/ToastProvider";
import AuthShell, { inputClass, labelClass, primaryBtnClass } from "../components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error: toastError } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toastError("Įveskite el. paštą.");
      return;
    }
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
      const res = await fetch(`${apiBase}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        throw new Error(data?.message ?? "Nepavyko išsiųsti nuorodos.");
      }
      // The API always responds generically (no account enumeration), so we
      // show the same confirmation regardless of whether the email exists.
      setSent(true);
      success(data?.message ?? "Jei paskyra egzistuoja, išsiuntėme nuorodą.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Tinklo klaida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Pamiršai slaptažodį?"
      subtitle="Įvesk el. paštą ir atsiųsime nuorodą jam atstatyti."
    >
      {sent ? (
        <div className="space-y-4">
          <div className="rounded-md border-2 border-ink bg-green/15 px-4 py-3 text-sm font-semibold">
            ✅ Jei tokia paskyra egzistuoja, į nurodytą el. paštą išsiuntėme atstatymo nuorodą. Patikrink pašto dėžutę.
          </div>
          <Link href="/login" className="block text-center text-sm font-semibold text-green-deep hover:underline">
            ← Grįžti į prisijungimą
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>El. paštas</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? "Siunčiama…" : "Siųsti nuorodą"}
          </button>
          <Link href="/login" className="block text-center text-sm font-semibold text-muted hover:text-ink">
            ← Atgal į prisijungimą
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
