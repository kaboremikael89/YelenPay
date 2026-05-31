import { User, Phone, Mail, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { DemoBanner } from "@/components/DemoBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO, demoUser, demoProfile, demoTontines } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let user: { id?: string; email?: string } | null = demoUser;
  let profile: Profile | null = demoProfile;
  let managedCount = demoTontines.filter(
    (t) => t.created_by === demoUser.id,
  ).length;

  if (!DEMO) {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u?.id ?? "")
      .single();
    profile = data as Profile | null;
    const { count } = await supabase
      .from("tontines")
      .select("id", { count: "exact", head: true })
      .eq("created_by", u?.id ?? "");
    managedCount = count ?? 0;
  }

  const isResponsable = managedCount > 0;

  const rows = [
    { icon: User, label: "Nom", value: profile?.full_name || "—" },
    { icon: Mail, label: "Email", value: user?.email || "—" },
    { icon: Phone, label: "Téléphone", value: profile?.phone || "—" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Mon profil" />
      <DemoBanner />

      <div className="space-y-4 p-4">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(profile?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 font-semibold">{profile?.full_name || "Membre"}</p>
          {isResponsable ? (
            <Badge tone="gold" className="mt-1">
              Responsable · {managedCount} tontine{managedCount > 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge tone="gray" className="mt-1">
              Membre
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="divide-y divide-border p-0">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <Icon className="h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs text-muted">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Paiements sécurisés par
          PayDunya
        </p>

        <form action={signOut}>
          <Button type="submit" variant="danger" className="w-full">
            <LogOut className="h-4 w-4" /> Se déconnecter
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
