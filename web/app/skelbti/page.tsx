import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CreateListingForm from "../components/CreateListingForm";

export const metadata: Metadata = {
  title: "Paskelbti skelbimą",
  description:
    "Paskelbk daiktą aukcione nemokamai — įkelk nuotraukas, parink kategoriją ir pradinę kainą, o pirkėjai kovos dėl jo realiu laiku.",
  alternates: { canonical: "/skelbti" },
};

export default function CreateListingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader />

      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 lg:px-8 lg:py-16">
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-green px-3 py-1.5 text-[13px] font-bold text-white shadow-chunky-sm">
          ➕ Naujas skelbimas
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Paskelbk daiktą
        </h1>
        <p className="mt-3 text-lg text-muted">
          Nemokamai, be komisinių. Įkelk nuotraukas, nustatyk pradinę kainą — ir leisk pirkėjams kovoti.
        </p>

        <div className="mt-8 chunky-lg rounded-chunk p-6 sm:p-7">
          <CreateListingForm />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
