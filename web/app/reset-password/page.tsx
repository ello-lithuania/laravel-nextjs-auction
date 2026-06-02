"use client"

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../components/ToastProvider";

// useSearchParams must live under a Suspense boundary (Next.js requirement).
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-8 text-sm text-slate-500">Kraunasi…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const missingLink = !token || !email;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missingLink) {
      toastError("Trūksta atstatymo nuorodos duomenų. Atidarykite nuorodą iš el. laiško.");
      return;
    }
    if (password !== passwordConfirm) {
      toastError("Slaptažodžiai nesutampa.");
      return;
    }
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
      const res = await fetch(`${apiBase}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirm,
        }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        throw new Error(data?.message ?? "Nepavyko atstatyti slaptažodžio.");
      }
      success(data?.message ?? "Slaptažodis atstatytas.");
      router.push("/login");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Tinklo klaida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Naujas slaptažodis</h1>
      {missingLink ? (
        <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          <p>Atstatymo nuoroda neteisinga arba nepilna. Atidarykite ją tiesiai iš gauto el. laiško.</p>
          <a href="/forgot-password" className="text-amber-900 underline">Prašyti naujos nuorodos</a>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Atstatote slaptažodį paskyrai <span className="font-medium text-slate-900">{email}</span>.</p>
          <label className="block text-sm text-slate-700">
            Naujas slaptažodis
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
            />
          </label>
          <label className="block text-sm text-slate-700">
            Pakartokite slaptažodį
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
            />
          </label>
          <p className="text-xs text-slate-500">
            Slaptažodį turi sudaryti bent 8 simboliai, didžiosios ir mažosios raidės bei skaičius.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Išsaugoma..." : "Atstatyti slaptažodį"}
          </button>
        </form>
      )}
    </div>
  );
}
