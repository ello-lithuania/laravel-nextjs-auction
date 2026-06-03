import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";
import AuthProvider from "./components/AuthProvider";

// Antraštėms — charakteringas display šriftas. Keisti kryptį galima čia
// (pvz. Clash Display / Cabinet Grotesk) — likusi sistema naudoja --font-display.
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"], // latin-ext = lietuviškos raidės ąčęėįšųūž
  variable: "--font-bricolage",
  display: "swap",
});

// UI tekstui — švarus, gerai skaitomas grotesque.
const ui = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dekaukciona.lt"),
  title: {
    default: "Dekaukciona – aukcionų platforma Lietuvoje",
    template: "%s | Dekaukciona",
  },
  description:
    "Dekaukciona – moderni lietuviška aukcionų platforma. Pirk ir parduok laikrodžius, automobilius, elektroniką, meną ir kolekcijas. Visiškai nemokama, be jokių komisinių.",
  keywords: [
    "aukcionas",
    "aukcionai",
    "internetinis aukcionas",
    "aukcionai Lietuvoje",
    "pirkti aukcione",
    "parduoti aukcione",
    "laikrodžiai",
    "automobiliai",
    "dekaukciona",
  ],
  applicationName: "Dekaukciona",
  authors: [{ name: "Dekaukciona" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "lt_LT",
    url: "https://dekaukciona.lt",
    siteName: "Dekaukciona",
    title: "Dekaukciona – aukcionų platforma Lietuvoje",
    description:
      "Pirk ir parduok aukcionuose: laikrodžiai, automobiliai, elektronika, menas. Visiškai nemokama, be jokių komisinių.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dekaukciona – aukcionų platforma",
    description:
      "Pirk ir parduok aukcionuose. Visiškai nemokama, be jokių komisinių.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lt"
      className={`${display.variable} ${ui.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://dekaukciona.lt/#organization",
                  name: "Dekaukciona",
                  url: "https://dekaukciona.lt",
                  logo: "https://dekaukciona.lt/icon.svg",
                  description:
                    "Lietuviška aukcionų platforma — pirk ir parduok aukcionuose nemokamai.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://dekaukciona.lt/#website",
                  url: "https://dekaukciona.lt",
                  name: "Dekaukciona",
                  publisher: { "@id": "https://dekaukciona.lt/#organization" },
                  inLanguage: "lt-LT",
                },
              ],
            }),
          }}
        />
        <AuthProvider>
          <ToastProvider>
            {/* reducedMotion="user" — visi Framer judesiai gerbia OS „mažiau judesio". */}
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
