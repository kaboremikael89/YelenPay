import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YelenPay — Tontines digitales du Sénégal",
  description:
    "Créez et gérez vos tontines en toute simplicité. Cotisations mobile money (Wave, Orange Money, Free Money) via PayDunya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="mx-auto min-h-screen w-full max-w-md bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
