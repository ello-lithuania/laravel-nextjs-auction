"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t-[2.5px] border-ink bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <span className="font-display text-2xl font-extrabold">
              DEKAUKCIONA<span className="text-green">.lt</span>
            </span>
            <p className="mt-3 text-sm text-cream/70">
              Lietuviška aukcionų platforma, kurioje smagu dalyvauti. Statyk, laimėk, pasiimk.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="font-display font-bold text-gold">Platforma</p>
              <ul className="mt-3 space-y-2 text-cream/70">
                <li><a href="/#aukcionai" className="hover:text-cream">Aukcionai</a></li>
                <li><a href="/#kaip-veikia" className="hover:text-cream">Kaip veikia</a></li>
                <li><Link href="/account/" className="hover:text-cream">Pardavėjams</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-display font-bold text-gold">Paskyra</p>
              <ul className="mt-3 space-y-2 text-cream/70">
                <li><Link href="/login" className="hover:text-cream">Prisijungti</Link></li>
                <li><Link href="/register" className="hover:text-cream">Registruotis</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-display font-bold text-gold">Daugiau</p>
              <ul className="mt-3 space-y-2 text-cream/70">
                <li><Link href="/naujienos" className="hover:text-cream">Naujienos</Link></li>
                <li><Link href="/kontaktai" className="hover:text-cream">Kontaktai</Link></li>
                <li><Link href="/privatumo-politika/" className="hover:text-cream">Privatumo politika</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-cream/15 pt-6 text-xs text-cream/50">
          © {new Date().getFullYear()} Dekaukciona. Visos teisės saugomos.
        </p>
      </div>
    </footer>
  );
}
