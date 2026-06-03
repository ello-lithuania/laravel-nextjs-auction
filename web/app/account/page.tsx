"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/ToastProvider";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { inputClass, labelClass, primaryBtnClass } from "../components/AuthShell";

type RequisiteType = "person" | "company";

// Laukai atitinka DB stulpelius (users.billing_*).
type Requisites = {
  billing_type: RequisiteType;
  billing_name: string;
  billing_code: string;
  billing_vat: string;
  billing_address: string;
  billing_phone: string;
  billing_iban: string;
};

const emptyRequisites: Requisites = {
  billing_type: "person",
  billing_name: "",
  billing_code: "",
  billing_vat: "",
  billing_address: "",
  billing_phone: "",
  billing_iban: "",
};

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

  const [req, setReq] = useState<Requisites>(emptyRequisites);
  const [savingReq, setSavingReq] = useState(false);

  // Užkraunam rekvizitus iš DB per /api/user (grąžina billing_* laukus).
  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(`${apiBase}/api/user`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (!active || !d) return;
        setReq({
          billing_type: (d.billing_type as RequisiteType) ?? "person",
          billing_name: (d.billing_name as string) ?? "",
          billing_code: (d.billing_code as string) ?? "",
          billing_vat: (d.billing_vat as string) ?? "",
          billing_address: (d.billing_address as string) ?? "",
          billing_phone: (d.billing_phone as string) ?? "",
          billing_iban: (d.billing_iban as string) ?? "",
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token, apiBase]);

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col bg-cream text-ink">
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-5 py-16">
          <div className="chunky-lg rounded-chunk p-10 text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Turi prisijungti</h1>
            <p className="mt-3 text-muted">Prisijunk, kad galėtum redaguoti paskyrą ir rekvizitus.</p>
            <Link href="/login" className={`mt-6 inline-block w-auto px-6 ${primaryBtnClass}`}>
              Prisijungti
            </Link>
          </div>
        </div>
        <SiteFooter />
      </main>
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
    success("Tavo paskyra atnaujinta");
  };

  const handleRequisitesSave = async () => {
    if (!req.billing_name.trim()) {
      toastError(req.billing_type === "company" ? "Įveskite įmonės pavadinimą" : "Įveskite vardą ir pavardę");
      return;
    }
    if (!token) {
      toastError("Jūsų sesija nebegalioja. Prisijunkite iš naujo.");
      return;
    }
    setSavingReq(true);
    try {
      const res = await fetch(`${apiBase}/api/user/requisites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(req),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        throw new Error(data?.message ?? "Nepavyko išsaugoti rekvizitų.");
      }
      success(data?.message ?? "Rekvizitai išsaugoti");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Tinklo klaida.");
    } finally {
      setSavingReq(false);
    }
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

  const setReqField = (field: keyof Requisites, value: string) =>
    setReq((r) => ({ ...r, [field]: value }));

  const isCompany = req.billing_type === "company";

  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 lg:px-8 lg:py-12">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Mano paskyra</h1>
        <p className="mt-2 text-muted">Tvarkyk profilį, rekvizitus ir slaptažodį.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Profilis */}
          <section className="chunky rounded-chunk p-6">
            <h2 className="font-display text-xl font-bold tracking-tight">Profilio informacija</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>Vardas</label>
                <input
                  className={`mt-1.5 ${inputClass}`}
                  value={name || user?.name || ""}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>El. paštas</label>
                <input
                  type="email"
                  className={`mt-1.5 ${inputClass}`}
                  value={email || user?.email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="button" onClick={handleProfileSave} className={primaryBtnClass}>
                Išsaugoti profilį
              </button>
            </div>
          </section>

          {/* Slaptažodis */}
          <section className="chunky rounded-chunk p-6">
            <h2 className="font-display text-xl font-bold tracking-tight">Slaptažodis</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>Dabartinis slaptažodis</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`mt-1.5 ${inputClass}`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Naujas slaptažodis</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={`mt-1.5 ${inputClass}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Pakartok slaptažodį</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={`mt-1.5 ${inputClass}`}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <button type="button" onClick={handlePasswordSave} disabled={savingPassword} className={primaryBtnClass}>
                {savingPassword ? "Keičiama…" : "Pakeisti slaptažodį"}
              </button>
            </div>
          </section>
        </div>

        {/* Rekvizitai */}
        <section className="chunky mt-6 rounded-chunk p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">Rekvizitai</h2>
              <p className="mt-1 text-sm text-muted">Naudojami atsiskaitymui ir sąskaitoms po laimėto aukciono.</p>
            </div>
            {/* Tipo perjungiklis */}
            <div className="flex rounded-md border-[2.5px] border-ink p-0.5">
              {(["person", "company"] as RequisiteType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReqField("billing_type", t)}
                  className={`rounded-[3px] px-3 py-1.5 text-sm font-bold transition ${
                    req.billing_type === t ? "bg-ink text-cream" : "text-ink"
                  }`}
                >
                  {t === "person" ? "Fizinis asmuo" : "Įmonė"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>{isCompany ? "Įmonės pavadinimas" : "Vardas ir pavardė"}</label>
              <input
                className={`mt-1.5 ${inputClass}`}
                value={req.billing_name}
                onChange={(e) => setReqField("billing_name", e.target.value)}
                placeholder={isCompany ? "UAB „Pavyzdys“" : "Vardenis Pavardenis"}
              />
            </div>
            <div>
              <label className={labelClass}>{isCompany ? "Įmonės kodas" : "Asmens kodas (neprivaloma)"}</label>
              <input
                className={`mt-1.5 ${inputClass}`}
                value={req.billing_code}
                onChange={(e) => setReqField("billing_code", e.target.value)}
              />
            </div>
            {isCompany ? (
              <div>
                <label className={labelClass}>PVM kodas (neprivaloma)</label>
                <input
                  className={`mt-1.5 ${inputClass}`}
                  value={req.billing_vat}
                  onChange={(e) => setReqField("billing_vat", e.target.value)}
                  placeholder="LT100000000000"
                />
              </div>
            ) : null}
            <div>
              <label className={labelClass}>Telefonas</label>
              <input
                className={`mt-1.5 ${inputClass}`}
                value={req.billing_phone}
                onChange={(e) => setReqField("billing_phone", e.target.value)}
                placeholder="+370 600 00000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Adresas</label>
              <input
                className={`mt-1.5 ${inputClass}`}
                value={req.billing_address}
                onChange={(e) => setReqField("billing_address", e.target.value)}
                placeholder="Gatvė, namas, miestas, pašto kodas"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Banko sąskaita (IBAN)</label>
              <input
                className={`mt-1.5 ${inputClass}`}
                value={req.billing_iban}
                onChange={(e) => setReqField("billing_iban", e.target.value)}
                placeholder="LT00 0000 0000 0000 0000"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequisitesSave}
            disabled={savingReq}
            className={`mt-5 sm:w-auto sm:px-6 ${primaryBtnClass}`}
          >
            {savingReq ? "Saugoma…" : "Išsaugoti rekvizitus"}
          </button>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
