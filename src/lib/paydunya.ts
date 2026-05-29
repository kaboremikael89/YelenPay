/**
 * Intégration PayDunya — agrégateur de paiement mobile money en Afrique de l'Ouest.
 * Couvre au Sénégal : Wave, Orange Money, Free Money, ainsi que les cartes bancaires.
 * Docs : https://paydunya.com/developers
 */

const MODE = process.env.PAYDUNYA_MODE === "live" ? "live" : "sandbox";

const BASE_URL =
  MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

function headers() {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY ?? "",
    "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY ?? "",
    "PAYDUNYA-PUBLIC-KEY": process.env.PAYDUNYA_PUBLIC_KEY ?? "",
    "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN ?? "",
  };
}

export interface CreateInvoiceParams {
  amount: number;
  description: string;
  /** Données renvoyées telles quelles par le webhook (ex: id de la cotisation). */
  customData: Record<string, string>;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
}

export interface CreateInvoiceResult {
  success: boolean;
  token?: string;
  /** URL de la page de paiement PayDunya (à ouvrir par le client). */
  invoiceUrl?: string;
  message: string;
}

/** Crée une facture PayDunya et retourne l'URL de paiement. */
export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<CreateInvoiceResult> {
  try {
    const res = await fetch(`${BASE_URL}/checkout-invoice/create`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        invoice: {
          total_amount: params.amount,
          description: params.description,
        },
        store: {
          name: "YelenPay",
          tagline: "Tontines digitales du Sénégal",
        },
        custom_data: params.customData,
        actions: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          callback_url: params.callbackUrl,
        },
      }),
    });

    const data = await res.json();

    if (data.response_code === "00") {
      return {
        success: true,
        token: data.token,
        invoiceUrl: data.response_text,
        message: "Facture créée",
      };
    }
    return {
      success: false,
      message: data.response_text || "Échec de création de la facture PayDunya",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Erreur réseau PayDunya",
    };
  }
}

export interface ConfirmResult {
  status: "completed" | "pending" | "cancelled" | "failed";
  customData: Record<string, string>;
}

/** Confirme l'état d'une facture à partir de son token (vérification serveur). */
export async function confirmInvoice(token: string): Promise<ConfirmResult> {
  const res = await fetch(`${BASE_URL}/checkout-invoice/confirm/${token}`, {
    method: "GET",
    headers: headers(),
  });
  const data = await res.json();
  return {
    status: data.status ?? "failed",
    customData: data.custom_data ?? {},
  };
}
