import Link from "next/link";
import { Plus, Users, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCFA, FREQUENCY_LABELS } from "@/lib/utils";
import type { Tontine } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("tontines")
    .select("*")
    .order("created_at", { ascending: false });
  const tontines = (data ?? []) as Tontine[];

  const activeCount = tontines.filter((t) => t.status === "active").length;
  const totalEngaged = tontines.reduce(
    (sum, t) => sum + t.amount * t.max_members,
    0,
  );

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Tableau de bord" />

      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <Wallet className="mb-2 h-5 w-5" />
              <p className="text-xs text-white/80">Total engagé</p>
              <p className="text-lg font-bold">{formatCFA(totalEngaged)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-accent text-accent-foreground">
            <CardContent className="p-4">
              <TrendingUp className="mb-2 h-5 w-5" />
              <p className="text-xs opacity-80">Tontines actives</p>
              <p className="text-lg font-bold">{activeCount}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Mes tontines</h2>
            <Link href="/tontines/new">
              <Button size="sm" variant="ghost" className="text-primary">
                <Plus className="h-4 w-4" /> Nouvelle
              </Button>
            </Link>
          </div>

          {tontines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted">
                Aucune tontine pour le moment.
                <br />
                Créez-en une pour commencer 👇
                <Link href="/tontines/new" className="mt-4 block">
                  <Button className="w-full">
                    <Plus className="h-4 w-4" /> Créer ma première tontine
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tontines.map((t) => (
                <Link key={t.id} href={`/tontines/${t.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{t.name}</h3>
                          <p className="flex items-center gap-1 text-sm text-muted">
                            <Users className="h-3.5 w-3.5" />
                            {t.max_members} membres ·{" "}
                            {FREQUENCY_LABELS[t.frequency] ?? t.frequency}
                          </p>
                        </div>
                        <Badge tone={t.status === "active" ? "green" : "gray"}>
                          {t.status === "active"
                            ? "Actif"
                            : t.status === "completed"
                              ? "Terminé"
                              : "En pause"}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm">
                        <span className="font-semibold text-primary">
                          {formatCFA(t.amount)}
                        </span>
                        <span className="text-xs text-muted">
                          Tour {t.current_round}/{t.max_members}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted">
          Connecté en tant que {user?.email}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
