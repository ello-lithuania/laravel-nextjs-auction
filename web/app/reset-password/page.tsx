"use client"

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../components/ToastProvider";
import AuthShell, { inputClass, labelClass, primaryBtnClass } from "../components/AuthShell";

// useSearchParams must live under a Suspense boundary (Next.js requirement).
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Kraunasi…</div>}>
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
    <AuthShell title="Naujas slaptažodis" subtitle={missingLink ? undefined : `Paskyrai ${email}`}>
      {missingLink ? (
        <div className="space-y-4">
          <div className="rounded-md border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold">
            ⚠️ Atstatymo nuoroda neteisinga arba nepilna. Atidaryk ją tiesiai iš gauto el. laiško.
          </div>
          <Link href="/forgot-password" className="block text-center text-sm font-semibold text-green-deep hover:underline">
            Prašyti naujos nuorodos
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Naujas slaptažodis</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass}>Pakartok slaptažodį</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <p className="text-xs text-muted">
            Slaptažodį turi sudaryti bent 8 simboliai, didžiosios ir mažosios raidės bei skaičius.
          </p>
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? "Išsaugoma…" : "Atstatyti slaptažodį"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
