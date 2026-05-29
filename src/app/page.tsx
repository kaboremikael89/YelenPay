import Link from "next/link";
import {
  Coins,
  Users,
  Calendar,
  ShieldCheck,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Gestion des membres",
    desc: "Ajoutez vos membres et définissez l'ordre de rotation.",
  },
  {
    icon: Calendar,
    title: "Suivi des tours",
    desc: "Cotisations, bénéficiaires et échéances suivis automatiquement.",
  },
  {
    icon: Smartphone,
    title: "Paiement mobile money",
    desc: "Wave, Orange Money, Free Money via PayDunya.",
  },
  {
    icon: BarChart3,
    title: "Transparence totale",
    desc: "Chaque cotisation est tracée et visible par tous.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary via-primary-dark to-[#0d3d22] p-6 text-white">
      <div className="pt-10 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
          <Coins className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">YelenPay</h1>
        <p className="mt-1 text-white/85">Tontines digitales du Sénégal 🇸🇳</p>
      </div>

      <div className="mt-10 flex-1 space-y-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-white/80">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <Link href="/register" className="block">
          <Button variant="accent" size="lg" className="w-full">
            Créer un compte
          </Button>
        </Link>
        <Link href="/login" className="block">
          <Button
            size="lg"
            className="w-full bg-white text-primary hover:bg-white/90"
          >
            Se connecter
          </Button>
        </Link>
        <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-xs text-white/70">
          <ShieldCheck className="h-3.5 w-3.5" /> Paiements sécurisés via
          PayDunya
        </p>
      </div>
    </div>
  );
}
