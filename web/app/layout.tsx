import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";
import AuthProvider from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "Aukcionų platforma",
  description:
    "Profesionali lietuviška aukcionų platforma, skirta pardavėjams ir pirkėjams su aiškia komisija.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
