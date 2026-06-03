"use client";

import Link from "next/link";
import AccountMenu from "./AccountMenu";

// Nuorodos rodo į /#… kad veiktų iš bet kurio puslapio (ne tik pradinio).
const navigation = [
  { label: "Aukcionai", href: "/#aukcionai" },
  { label: "Kaip veikia", href: "/#kaip-veikia" },
  { label: "Pardavėjams", href: "/account/" },
  { label: "Kontaktai", href: "/kontaktai" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[2.5px] border-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border-[2.5px] border-ink bg-green text-lg font-extrabold text-white shadow-chunky-sm">
            D
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            DEKAUKCIONA<span className="text-green-deep">.lt</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} className="transition hover:text-green-deep">
              {item.label}
            </a>
          ))}
        </nav>
        <AccountMenu />
      </div>
    </header>
  );
}
