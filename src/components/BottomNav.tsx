"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/tontines/new", label: "Créer", icon: PlusCircle },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[28rem] -translate-x-1/2">
      <nav className="flex items-center justify-around rounded-full border border-border/70 bg-card/95 p-2 shadow-[0_12px_40px_-12px_rgba(43,33,28,0.35)] backdrop-blur">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all",
                active
                  ? "bg-dark text-dark-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {active && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
