"use client"

import { useState } from "react";
import { useToast } from "../components/ToastProvider";

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
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Pamiršote slaptažodį?</h1>
      {sent ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            Jei tokia paskyra egzistuoja, į nurodytą el. paštą išsiuntėme slaptažodžio atstatymo nuorodą.
            Patikrinkite savo pašto dėžutę.
          </p>
          <a href="/login" className="text-sm text-slate-600 hover:underline">Grįžti į prisijungimą</a>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Įveskite paskyros el. paštą ir atsiųsime nuorodą slaptažodžiui atstatyti.
          </p>
          <label className="block text-sm text-slate-700">
            El. paštas
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
            />
          </label>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Siunčiama..." : "Siųsti nuorodą"}
            </button>
            <a href="/login" className="text-sm text-slate-600 hover:underline">Atgal į prisijungimą</a>
          </div>
        </form>
      )}
    </div>
  );
}
