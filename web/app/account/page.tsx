"use client"

import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/ToastProvider";

export default function AccountPage() {
  const { user, token, setUser } = useAuth();
  const { success, error: toastError } = useToast();
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">Turite prisijungti</h1>
          <p className="mt-3 text-slate-600">Prisijunkite, kad galėtumėte redaguoti paskyrą ir slaptažodį.</p>
        </div>
      </div>
    );
  }

  const handleProfileSave = () => {
    const updatedName = name || user?.name || "";
    const updatedEmail = email || user?.email || "";
    if (!updatedName || !updatedEmail) {
      toastError("Vardas ir el. paštas yra privalomi");
      return;
    }
    setUser({ ...user, name: updatedName, email: updatedEmail });
    success("Jūsų paskyra atnaujinta");
  };

  const handlePasswordSave = async () => {
    if (!currentPassword) {
      toastError("Įveskite dabartinį slaptažodį");
      return;
    }
    if (!password || password.length < 8) {
      toastError("Naujas slaptažodis turi būti bent 8 simbolių");
      return;
    }
    if (password !== passwordConfirm) {
      toastError("Slaptažodžiai nesutampa");
      return;
    }
    if (!token) {
      toastError("Jūsų sesija nebegalioja. Prisijunkite iš naujo.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${apiBase}/api/user/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirm,
        }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        throw new Error(data?.message ?? "Nepavyko pakeisti slaptažodžio.");
      }
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
      success(data?.message ?? "Slaptažodis pakeistas.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Tinklo klaida.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="text-2xl font-semibold text-slate-950">Mano paskyra</h1>
          <p className="mt-2 text-slate-600">Atnaujinkite profilio informaciją ir pakeiskite slaptažodį.</p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Profilio informacija</h2>
              <label className="block text-sm text-slate-700">
                Vardas
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={name || user?.name || ""}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block text-sm text-slate-700">
                El. paštas
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={email || user?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={handleProfileSave}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
              >
                Išsaugoti profilio pakeitimus
              </button>
            </div>

            <div className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Slaptažodis</h2>
              <label className="block text-sm text-slate-700">
                Dabartinis slaptažodis
                <input
                  type="password"
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label className="block text-sm text-slate-700">
                Naujas slaptažodis
                <input
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="block text-sm text-slate-700">
                Pakartokite slaptažodį
                <input
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </label>
              <p className="text-xs text-slate-500">
                Bent 8 simboliai, didžiosios ir mažosios raidės bei skaičius.
              </p>
              <button
                type="button"
                onClick={handlePasswordSave}
                disabled={savingPassword}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:opacity-60"
              >
                {savingPassword ? "Keičiama..." : "Pakeisti slaptažodį"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
