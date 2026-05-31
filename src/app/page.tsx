import Link from "next/link";
import { Wifi, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-12">
      {/* Logo */}
      <div className="text-center">
        <span className="text-2xl font-extrabold tracking-tight text-foreground">
          Yelen<span className="text-primary">Pay</span>
        </span>
      </div>

      {/* Carte tontine (visuel hero) */}
      <div className="mt-8">
        <div className="card-sheen relative aspect-[1.6/1] w-full overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl shadow-primary/30">
          <div className="flex items-start justify-between">
            <span className="text-lg font-bold tracking-wide">TONTINE</span>
            <Wifi className="h-6 w-6 rotate-90 opacity-90" />
          </div>
          <div className="mt-7 h-8 w-12 rounded-md bg-white/30" />
          <p className="mt-6 font-mono text-xl tracking-[0.2em]">
            2891 · · · · 1027
          </p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70">
                Membre
              </p>
              <p className="text-sm font-semibold">Awa Diop</p>
            </div>
            <p className="text-sm font-bold">YelenPay</p>
          </div>
        </div>
      </div>

      {/* Texte */}
      <div className="mt-10 flex-1">
        <span className="inline-block rounded-full bg-card px-3 py-1 text-xs font-medium text-muted shadow-sm">
          Plateforme 100% sécurisée
        </span>
        <h1 className="mt-4 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight">
          Vos tontines,
          <br />
          en plus <span className="text-primary">simple.</span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Créez votre tontine, suivez les cotisations et encaissez en mobile
          money (Wave, Orange Money, Free Money) — le tout depuis votre
          téléphone.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 space-y-3">
        <Link href="/register" className="block">
          <Button size="lg" className="w-full">
            Commencer
          </Button>
        </Link>
        <Link href="/login" className="block">
          <Button variant="ghost" size="lg" className="w-full">
            J&apos;ai déjà un compte
          </Button>
        </Link>
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Paiements sécurisés via
          PayDunya
        </p>
      </div>
    </div>
  );
}
