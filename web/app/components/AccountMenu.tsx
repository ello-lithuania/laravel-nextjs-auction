"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This state is only used to defer the authenticated menu until after hydration,
    // preventing a server/client HTML mismatch when auth is stored in localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Prisijungti
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-slate-950 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800"
        >
          Paskelbti skelbimą
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3">
      <Link
        href="/account"
        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        Mano paskyra
      </Link>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-200/20 transition hover:bg-slate-800"
      >
        {user.name.split(" ")[0]}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
            <Link href="/account" className="block rounded-2xl bg-slate-100 px-4 py-2 hover:bg-slate-200">
              Redaguoti paskyrą
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Atsijungti
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
