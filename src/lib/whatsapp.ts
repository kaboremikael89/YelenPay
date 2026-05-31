/**
 * Intégration WhatsApp — niveau 1 : liens "click-to-chat" (wa.me).
 *
 * Gratuit, sans API ni vérification : ouvre WhatsApp avec un message pré-rempli
 * vers le numéro du membre. Le responsable n'a qu'à appuyer sur « Envoyer ».
 *
 * Pour l'automatisation (envois en masse, rappels programmés, réception de
 * réponses), voir docs/whatsapp-integration.md (WhatsApp Business Cloud API).
 */

import { formatCFA, FREQUENCY_LABELS } from "./utils";
import type { Tontine } from "./types";

/** Normalise un numéro sénégalais/international au format wa.me (chiffres, indicatif, sans +). */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  // Numéro local sénégalais (9 chiffres, commence par 7) → préfixe 221.
  if (digits.length === 9 && digits.startsWith("7")) digits = "221" + digits;
  // Numéro avec 0 initial → on retire le 0 et on préfixe 221.
  else if (digits.length === 10 && digits.startsWith("0"))
    digits = "221" + digits.slice(1);
  return digits;
}

function waLink(phone: string | null, text: string): string | null {
  const p = normalizePhone(phone);
  const encoded = encodeURIComponent(text);
  // Sans numéro valide : lien de partage générique (choix du contact dans WhatsApp).
  if (!p) return `https://wa.me/?text=${encoded}`;
  return `https://wa.me/${p}?text=${encoded}`;
}

/** Lien d'invitation d'un membre à rejoindre la tontine. */
export function waInviteLink(
  memberName: string,
  phone: string | null,
  tontine: Tontine,
): string | null {
  const freq = FREQUENCY_LABELS[tontine.frequency] ?? tontine.frequency;
  const text =
    `Bonjour ${memberName}, vous êtes invité(e) à rejoindre la tontine ` +
    `« ${tontine.name} » sur YelenPay.\n` +
    `Cotisation : ${formatCFA(tontine.amount)} (${freq}).\n` +
    `Réponse et paiement en mobile money. 🙏`;
  return waLink(phone, text);
}

/** Lien de relance d'un membre n'ayant pas encore payé sa cotisation du tour. */
export function waReminderLink(
  memberName: string,
  phone: string | null,
  tontine: Tontine,
  round: number,
): string | null {
  const text =
    `Bonjour ${memberName}, petit rappel 🔔 : votre cotisation de ` +
    `${formatCFA(tontine.amount)} pour la tontine « ${tontine.name} » ` +
    `(tour ${round}) est attendue.\n` +
    `Merci de régler dès que possible. — via YelenPay`;
  return waLink(phone, text);
}
