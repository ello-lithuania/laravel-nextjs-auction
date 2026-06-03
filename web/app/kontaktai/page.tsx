import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ContactForm from "../components/ContactForm";

export const metadata: Metadata = {
  title: "Kontaktai",
  description:
    "Susisiek su Dekaukciona komanda — užpildyk kontaktų formą ir parašyk mums klausimą ar pasiūlymą.",
  alternates: { canonical: "/kontaktai" },
  openGraph: {
    type: "website",
    title: "Kontaktai | Dekaukciona",
    description: "Susisiek su Dekaukciona komanda per kontaktų formą.",
    url: "/kontaktai",
  },
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <div className="mx-auto w-full max-w-xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-gold px-3 py-1.5 text-[13px] font-bold shadow-chunky-sm">
          ✉️ Kontaktai
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Parašyk mums
        </h1>
        <p className="mt-3 text-lg text-muted">
          Turi klausimą, pasiūlymą ar pastebėjai problemą? Užpildyk formą ir mes atsakysime.
        </p>

        <div className="mt-8 chunky-lg rounded-chunk p-6 sm:p-7">
          <ContactForm />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
