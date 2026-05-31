import { notFound } from "next/navigation";
import {
  Crown,
  Check,
  Clock,
  Trophy,
  ShieldCheck,
  UserPlus,
  Trash2,
  MessageCircle,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCFA, FREQUENCY_LABELS } from "@/lib/utils";
import { buildRoundState, beneficiaryForRound, potAmount } from "@/lib/tontine";
import {
  payContribution,
  advanceRound,
  addMember,
  removeMember,
} from "@/app/tontines/actions";
import { waReminderLink, waInviteLink } from "@/lib/whatsapp";
import {
  DEMO,
  demoUser,
  getDemoTontine,
  getDemoMembers,
  getDemoContributions,
} from "@/lib/demo";
import { DemoBanner } from "@/components/DemoBanner";
import type { Contribution, Tontine, TontineMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TontineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; cancel?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  let user: { id?: string } | null = demoUser;
  let t: Tontine;
  let members: TontineMember[];
  let contributions: Contribution[];

  if (DEMO) {
    const demoT = getDemoTontine(id);
    if (!demoT) notFound();
    t = demoT;
    members = getDemoMembers(id);
    contributions = getDemoContributions(id).filter(
      (c) => c.round === t.current_round,
    );
  } else {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;

    const { data: tontine } = await supabase
      .from("tontines")
      .select("*")
      .eq("id", id)
      .single();
    if (!tontine) notFound();
    t = tontine as Tontine;

    const { data: membersData } = await supabase
      .from("tontine_members")
      .select("*")
      .eq("tontine_id", id)
      .order("position");
    members = (membersData ?? []) as TontineMember[];

    const { data: contribData } = await supabase
      .from("contributions")
      .select("*")
      .eq("tontine_id", id)
      .eq("round", t.current_round);
    contributions = (contribData ?? []) as Contribution[];
  }

  const roundState = buildRoundState(members, contributions, t.current_round);
  const beneficiary = beneficiaryForRound(members, t.current_round);
  const isOwner = user?.id === t.created_by;
  const pot = potAmount(t, members.length);
  const myMember = members.find((m) => m.user_id === user?.id);
  const myState = roundState.find((s) => s.member.id === myMember?.id);

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title={t.name} backHref="/dashboard" />
      <DemoBanner />

      <div className="space-y-4 p-4">
        {sp.paid && (
          <Banner tone="green">Paiement reçu, merci ! 🎉</Banner>
        )}
        {sp.cancel && <Banner tone="gray">Paiement annulé.</Banner>}
        {sp.error && (
          <Banner tone="red">
            Le paiement n&apos;a pas pu être initié. Vérifiez la configuration
            PayDunya.
          </Banner>
        )}

        {/* Cagnotte du tour */}
        <Card className="card-sheen border-0 text-white shadow-xl shadow-primary/25">
          <CardContent className="p-6">
            <p className="text-sm text-white/80">
              Cagnotte du tour {t.current_round}/{members.length}
            </p>
            <p className="text-3xl font-bold">{formatCFA(pot)}</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-accent" />
              Bénéficiaire : <strong>{beneficiary?.name ?? "—"}</strong>
            </div>
            <p className="mt-1 text-xs text-white/70">
              {formatCFA(t.amount)} ·{" "}
              {FREQUENCY_LABELS[t.frequency] ?? t.frequency}
            </p>
          </CardContent>
        </Card>

        {/* Mon action de paiement */}
        {myState && !myState.isBeneficiary && (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Ma cotisation</p>
                <p className="text-xs text-muted">
                  {myState.isPaid ? "Déjà payée" : "En attente de paiement"}
                </p>
              </div>
              {myState.isPaid ? (
                <Badge tone="green">
                  <Check className="mr-1 h-3 w-3" /> Payé
                </Badge>
              ) : (
                myState.contribution && (
                  <form action={payContribution}>
                    <input
                      type="hidden"
                      name="contribution_id"
                      value={myState.contribution.id}
                    />
                    <input type="hidden" name="tontine_id" value={t.id} />
                    <Button type="submit" variant="accent" size="sm">
                      Payer {formatCFA(myState.contribution.amount)}
                    </Button>
                  </form>
                )
              )}
            </CardContent>
          </Card>
        )}

        {/* État des cotisations */}
        <div>
          <h2 className="mb-2 font-semibold">État des cotisations</h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {roundState.map((s) => (
                <div
                  key={s.member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-xs font-semibold">
                      {s.member.position}
                    </span>
                    <span className="text-sm font-medium">{s.member.name}</span>
                    {s.isBeneficiary && (
                      <Crown className="h-3.5 w-3.5 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {s.isBeneficiary ? (
                      <Badge tone="gold">Bénéficiaire</Badge>
                    ) : s.isPaid ? (
                      <Badge tone="green">
                        <Check className="mr-1 h-3 w-3" /> Payé
                      </Badge>
                    ) : (
                      <Badge tone="gray">
                        <Clock className="mr-1 h-3 w-3" /> En attente
                      </Badge>
                    )}
                    {/* Relance WhatsApp (responsable, membre non payé) */}
                    {isOwner && !s.isBeneficiary && !s.isPaid && (
                      <a
                        href={
                          waReminderLink(
                            s.member.name,
                            s.member.phone,
                            t,
                            t.current_round,
                          ) ?? "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Relancer ${s.member.name} sur WhatsApp`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1da851] transition-colors hover:bg-[#25D366]/25"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Espace responsable */}
        {isOwner && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Espace responsable</h2>
            </div>
            <Card>
              <CardContent className="space-y-4 p-4">
                {/* Liste des membres + invitation / suppression */}
                <div className="divide-y divide-border">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-xs font-semibold">
                          {m.position}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          {m.phone && (
                            <p className="text-xs text-muted">{m.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={waInviteLink(m.name, m.phone, t) ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Inviter ${m.name} sur WhatsApp`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1da851] hover:bg-[#25D366]/25"
                        >
                          <Send className="h-4 w-4" />
                        </a>
                        {m.user_id !== user?.id && (
                          <form action={removeMember}>
                            <input
                              type="hidden"
                              name="tontine_id"
                              value={t.id}
                            />
                            <input
                              type="hidden"
                              name="member_id"
                              value={m.id}
                            />
                            <button
                              type="submit"
                              aria-label={`Retirer ${m.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger hover:bg-danger/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ajout d'un membre */}
                <form action={addMember} className="space-y-2 border-t border-border pt-3">
                  <p className="text-sm font-semibold">Ajouter un membre</p>
                  <input type="hidden" name="tontine_id" value={t.id} />
                  <Input name="name" placeholder="Nom du membre" required />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Téléphone (+221 7X…)"
                  />
                  <Button type="submit" variant="dark" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4" /> Ajouter
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gestion du tour (responsable) */}
        {isOwner && t.status === "active" && (
          <form action={advanceRound}>
            <input type="hidden" name="tontine_id" value={t.id} />
            <Button type="submit" variant="outline" className="w-full">
              <Trophy className="h-4 w-4" />
              {t.current_round >= members.length
                ? "Clôturer la tontine"
                : "Passer au tour suivant"}
            </Button>
          </form>
        )}
        {t.status === "completed" && (
          <Banner tone="green">Cette tontine est terminée. 🏁</Banner>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "green" | "gray" | "red";
  children: React.ReactNode;
}) {
  const cls = {
    green: "bg-primary/10 text-primary",
    gray: "bg-black/5 text-muted",
    red: "bg-danger/10 text-danger",
  }[tone];
  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-medium ${cls}`}>
      {children}
    </div>
  );
}
