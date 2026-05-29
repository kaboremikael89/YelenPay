import { NextResponse, type NextRequest } from "next/server";
import { confirmInvoice } from "@/lib/paydunya";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Webhook (IPN) PayDunya.
 * PayDunya envoie un POST (form-urlencoded) avec `data[...]` à la fin du paiement.
 * On revérifie systématiquement le statut côté serveur via le token avant de valider.
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const token =
      (form.get("data[invoice][token]") as string) ||
      (form.get("token") as string) ||
      "";

    if (!token) {
      return NextResponse.json({ error: "token manquant" }, { status: 400 });
    }

    // Source de vérité : on confirme auprès de PayDunya.
    const result = await confirmInvoice(token);
    const contributionId = result.customData.contribution_id;

    if (result.status === "completed" && contributionId) {
      const admin = createAdminClient();
      await admin
        .from("contributions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", contributionId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "erreur" },
      { status: 500 },
    );
  }
}
