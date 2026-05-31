import Link from "next/link";
import { Plus, ArrowUp, BarChart3, Bell, Grid2x2, Users, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { DemoBanner } from "@/components/DemoBanner";
import { Badge } from "@/components/ui/badge";
import { formatCFA, FREQUENCY_LABELS } from "@/lib/utils";
import { DEMO, demoTontines, demoProfile } from "@/lib/demo";
import type { Tontine } from "@/lib/types";

export const dynamic = "force-dynamic";

const actions = [
  { href: "/tontines/new", label: "Nouvelle", icon: Plus },
  { href: "/dashboard", label: "Payer", icon: ArrowUp },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/profile", label: "Plus", icon: Grid2x2 },
];

export default async function DashboardPage() {
  let tontines: Tontine[] = demoTontines;
  let name = demoProfile.full_name ?? "Membre";

  if (!DEMO) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const [{ data }, { data: profile }] = await Promise.all([
      supabase
        .from("tontines")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("full_name").eq("id", user?.id ?? "").single(),
    ]);
    tontines = (data ?? []) as Tontine[];
    name = profile?.full_name ?? user?.email ?? "Membre";
  }

  const totalEngaged = tontines.reduce(
    (sum, t) => sum + t.amount * t.max_members,
    0,
  );
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-28">
      <DemoBanner />

      {/* Header dégradé */}
      <div className="bg-orange-grad rounded-b-[2.5rem] px-5 pb-8 pt-6 text-white shadow-lg shadow-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-lg font-bold backdrop-blur">
              {initial}
            </div>
            <div>
              <p className="text-xs text-white/80">Bonjour 👋</p>
              <p className="text-base font-bold leading-tight">{name}</p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm text-white/80">Total engagé</p>
          <p className="text-[2.5rem] font-extrabold leading-tight tracking-tight">
            {formatCFA(totalEngaged)}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5">
        {/* Carte promo sombre */}
        <div className="-mt-4 flex items-center gap-3 rounded-3xl bg-dark p-4 text-dark-foreground shadow-lg">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Gift className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Invitez vos proches</p>
            <p className="text-xs text-white/60">
              Lancez une tontine en famille ou entre amis.
            </p>
          </div>
          <Link
            href="/tontines/new"
            className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground"
          >
            Inviter
          </Link>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-4 gap-2">
          {actions.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-sm transition-colors hover:bg-primary/5">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <span className="text-xs font-medium text-muted">{label}</span>
            </Link>
          ))}
        </div>

        {/* Liste des tontines */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Mes tontines</h2>
            <Link href="/tontines/new" className="text-sm font-semibold text-primary">
              + Nouvelle
            </Link>
          </div>

          {tontines.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted shadow-sm">
              Aucune tontine pour le moment.
              <Link
                href="/tontines/new"
                className="mt-4 block rounded-full bg-orange-grad py-3 font-semibold text-white"
              >
                Créer ma première tontine
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tontines.map((t) => (
                <Link key={t.id} href={`/tontines/${t.id}`}>
                  <div className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-grad text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{t.name}</p>
                      <p className="text-xs text-muted">
                        {t.max_members} membres ·{" "}
                        {FREQUENCY_LABELS[t.frequency] ?? t.frequency} · Tour{" "}
                        {t.current_round}/{t.max_members}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCFA(t.amount)}
                      </p>
                      <Badge tone={t.status === "active" ? "green" : "gray"}>
                        {t.status === "active"
                          ? "Actif"
                          : t.status === "completed"
                            ? "Terminé"
                            : "Pause"}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
