import { Wallet, Users, TrendingUp, PiggyBank } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, CardContent } from "@/components/ui/card";
import { formatCFA } from "@/lib/utils";
import { DEMO, demoTontines } from "@/lib/demo";
import type { Tontine } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let tontines: Tontine[] = demoTontines;

  if (!DEMO) {
    const supabase = await createClient();
    const { data } = await supabase.from("tontines").select("*");
    tontines = (data ?? []) as Tontine[];
  }

  const totalEngaged = tontines.reduce(
    (s, t) => s + t.amount * t.max_members,
    0,
  );
  const totalMembers = tontines.reduce((s, t) => s + t.max_members, 0);
  const active = tontines.filter((t) => t.status === "active").length;

  const stats = [
    { label: "Total engagé", value: formatCFA(totalEngaged), icon: Wallet, grad: true },
    { label: "Tontines actives", value: String(active), icon: TrendingUp },
    { label: "Membres", value: String(totalMembers), icon: Users },
    { label: "Tontines", value: String(tontines.length), icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen pb-28">
      <DemoBanner />
      <AppHeader title="Rapports" />

      <div className="space-y-6 px-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, grad }) => (
            <div
              key={label}
              className={
                grad
                  ? "bg-orange-grad rounded-3xl p-4 text-white shadow-lg shadow-primary/20"
                  : "rounded-3xl border border-border/70 bg-card p-4 shadow-sm"
              }
            >
              <Icon className={`mb-2 h-5 w-5 ${grad ? "" : "text-primary"}`} />
              <p className={`text-xs ${grad ? "text-white/80" : "text-muted"}`}>
                {label}
              </p>
              <p className="text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">Avancement</h2>
          <Card>
            <CardContent className="space-y-4 p-5">
              {tontines.length === 0 && (
                <p className="text-sm text-muted">Aucune donnée.</p>
              )}
              {tontines.map((t) => {
                const pct = Math.round(
                  (t.current_round / Math.max(t.max_members, 1)) * 100,
                );
                return (
                  <div key={t.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold">{t.name}</span>
                      <span className="text-muted">
                        {t.current_round}/{t.max_members}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-orange-grad"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted">
          Export PDF / Excel — bientôt disponible.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
