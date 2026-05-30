"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/paydunya";
import { DEMO } from "@/lib/demo";
import type { TontineMember } from "@/lib/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Crée les cotisations « en attente » d'un tour pour tous les membres,
 * sauf le bénéficiaire du tour.
 */
async function seedRoundContributions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  tontineId: string,
  amount: number,
  members: TontineMember[],
  round: number,
) {
  const rows = members
    .filter((m) => m.position !== round) // le bénéficiaire ne cotise pas
    .map((m) => ({
      tontine_id: tontineId,
      round,
      member_id: m.id,
      amount,
      status: "pending",
    }));
  if (rows.length === 0) return;
  await supabase.from("contributions").upsert(rows, {
    onConflict: "tontine_id,round,member_id",
    ignoreDuplicates: true,
  });
}

export async function createTontine(_prev: unknown, formData: FormData) {
  if (DEMO) redirect("/tontines/t1");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const amount = parseInt(String(formData.get("amount") ?? "0").replace(/\D/g, ""), 10);
  const frequency = String(formData.get("frequency") ?? "monthly");
  const description = String(formData.get("description") ?? "").trim() || null;
  const membersRaw = String(formData.get("members") ?? "");

  if (!name || !amount || amount <= 0)
    return { error: "Nom et montant valides requis." };

  // Récupère le nom du créateur.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const extraNames = membersRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const memberNames = [profile?.full_name || "Moi", ...extraNames];
  const maxMembers = memberNames.length;
  if (maxMembers < 2)
    return { error: "Ajoutez au moins un autre membre." };

  const { data: tontine, error: tErr } = await supabase
    .from("tontines")
    .insert({
      name,
      description,
      amount,
      frequency,
      max_members: maxMembers,
      created_by: user.id,
      current_round: 1,
      status: "active",
    })
    .select()
    .single();
  if (tErr || !tontine) return { error: tErr?.message ?? "Échec de création." };

  const memberRows = memberNames.map((n, i) => ({
    tontine_id: tontine.id,
    user_id: i === 0 ? user.id : null,
    name: n,
    position: i + 1,
  }));

  const { data: members, error: mErr } = await supabase
    .from("tontine_members")
    .insert(memberRows)
    .select();
  if (mErr) return { error: mErr.message };

  await seedRoundContributions(
    supabase,
    tontine.id,
    amount,
    (members ?? []) as TontineMember[],
    1,
  );

  revalidatePath("/dashboard");
  redirect(`/tontines/${tontine.id}`);
}

/** Lance un paiement PayDunya pour une cotisation et redirige vers la page de paiement. */
export async function payContribution(formData: FormData) {
  const contributionId = String(formData.get("contribution_id") ?? "");
  if (DEMO) {
    const tontineId = String(formData.get("tontine_id") ?? "t1");
    redirect(`/tontines/${tontineId}?paid=1`);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contribution } = await supabase
    .from("contributions")
    .select("*, tontines(name), tontine_members(name)")
    .eq("id", contributionId)
    .single();

  if (!contribution) redirect("/dashboard");

  const invoice = await createInvoice({
    amount: contribution.amount,
    description: `Cotisation tontine « ${contribution.tontines?.name ?? ""} » — tour ${contribution.round}`,
    customData: { contribution_id: contributionId },
    returnUrl: `${APP_URL}/tontines/${contribution.tontine_id}?paid=1`,
    cancelUrl: `${APP_URL}/tontines/${contribution.tontine_id}?cancel=1`,
    callbackUrl: `${APP_URL}/api/paydunya/webhook`,
  });

  if (!invoice.success || !invoice.invoiceUrl) {
    redirect(`/tontines/${contribution.tontine_id}?error=paydunya`);
  }

  await supabase
    .from("contributions")
    .update({ payment_token: invoice.token })
    .eq("id", contributionId);

  redirect(invoice.invoiceUrl);
}

/** Passe la tontine au tour suivant (réservé au créateur). */
export async function advanceRound(formData: FormData) {
  const tontineId = String(formData.get("tontine_id") ?? "");
  if (DEMO) redirect(`/tontines/${tontineId}?demo=1`);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tontine } = await supabase
    .from("tontines")
    .select("*")
    .eq("id", tontineId)
    .single();
  if (!tontine || tontine.created_by !== user.id) redirect("/dashboard");

  const { data: members } = await supabase
    .from("tontine_members")
    .select("*")
    .eq("tontine_id", tontineId);

  const total = members?.length ?? 0;
  const next = tontine.current_round + 1;

  if (next > total) {
    await supabase
      .from("tontines")
      .update({ status: "completed" })
      .eq("id", tontineId);
  } else {
    await supabase
      .from("tontines")
      .update({ current_round: next })
      .eq("id", tontineId);
    await seedRoundContributions(
      supabase,
      tontineId,
      tontine.amount,
      (members ?? []) as TontineMember[],
      next,
    );
  }

  revalidatePath(`/tontines/${tontineId}`);
}
