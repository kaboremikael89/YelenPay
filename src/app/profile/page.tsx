import { User, Phone, Mail, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  const rows = [
    { icon: User, label: "Nom", value: profile?.full_name || "—" },
    { icon: Mail, label: "Email", value: user?.email || "—" },
    { icon: Phone, label: "Téléphone", value: profile?.phone || "—" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Mon profil" />

      <div className="space-y-4 p-4">
        <div className="flex flex-col items-center py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(profile?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 font-semibold">{profile?.full_name || "Membre"}</p>
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
