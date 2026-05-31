import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="mx-auto min-h-screen w-full max-w-md bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
