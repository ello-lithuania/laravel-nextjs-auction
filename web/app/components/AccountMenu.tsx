"use client";

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
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className="press rounded-[5px] border-[2.5px] border-ink bg-paper px-4 py-2 text-sm font-bold text-ink shadow-chunky-sm"
        >
          Prisijungti
        </Link>
        <Link
          href="/skelbti"
          className="press rounded-[5px] border-[2.5px] border-ink bg-green px-4 py-2 text-sm font-bold text-white shadow-chunky-sm"
        >
          Paskelbti
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="press flex items-center gap-2 rounded-[5px] border-[2.5px] border-ink bg-gold px-4 py-2 text-sm font-bold text-ink shadow-chunky-sm"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-paper text-[11px] font-extrabold">
          {user.name.charAt(0).toUpperCase()}
        </span>
        {user.name.split(" ")[0]}
      </button>
      {open ? (
        <div className="chunky absolute right-0 top-12 z-50 w-60 rounded-chunk p-4">
          <p className="font-display text-base font-bold">{user.name}</p>
          <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-[5px] border-2 border-ink bg-sand px-3 py-2 text-sm font-semibold hover:bg-cream"
          >
            Mano paskyra
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="press mt-2 w-full rounded-[5px] border-2 border-ink bg-ink px-3 py-2 text-sm font-bold text-cream"
          >
            Atsijungti
          </button>
        </div>
      ) : null}
    </div>
  );
}
