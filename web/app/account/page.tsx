"use client"

import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/ToastProvider";

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

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

  const handlePasswordSave = () => {
    if (!password || password.length < 6) {
      toastError("Slaptažodis turi būti bent 6 simbolių");
      return;
    }
    if (password !== passwordConfirm) {
      toastError("Slaptažodžiai nesutampa");
      return;
    }
    setPassword("");
    setPasswordConfirm("");
    success("Slaptažodis atnaujintas (vietoje)");
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
                Naujas slaptažodis
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="block text-sm text-slate-700">
                Pakartokite slaptažodį
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={handlePasswordSave}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
              >
                Pakeisti slaptažodį
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
