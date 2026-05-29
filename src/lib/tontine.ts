import type { Contribution, Tontine, TontineMember } from "./types";

/**
 * Détermine le bénéficiaire d'un tour donné.
 * Règle : le membre dont la position == numéro du tour reçoit la cagnotte.
 */
export function beneficiaryForRound(
  members: TontineMember[],
  round: number,
): TontineMember | null {
  return members.find((m) => m.position === round) ?? null;
}

/** Montant total de la cagnotte distribuée à chaque tour. */
export function potAmount(tontine: Tontine, memberCount: number): number {
  return tontine.amount * memberCount;
}

/** Nombre total de tours d'un cycle complet (= nombre de membres). */
export function totalRounds(members: TontineMember[]): number {
  return members.length;
}

export interface RoundContributionState {
  member: TontineMember;
  contribution: Contribution | null;
  isPaid: boolean;
  isBeneficiary: boolean;
}

/**
 * Construit l'état des cotisations d'un tour : pour chaque membre, payé ou non,
 * et qui est le bénéficiaire.
 */
export function buildRoundState(
  members: TontineMember[],
  contributions: Contribution[],
  round: number,
): RoundContributionState[] {
  const beneficiary = beneficiaryForRound(members, round);
  return [...members]
    .sort((a, b) => a.position - b.position)
    .map((member) => {
      const contribution =
        contributions.find(
          (c) => c.member_id === member.id && c.round === round,
        ) ?? null;
      return {
        member,
        contribution,
        isPaid: contribution?.status === "paid",
        isBeneficiary: beneficiary?.id === member.id,
      };
    });
}

/** Le tour est complet quand tous les membres (hors bénéficiaire) ont payé. */
export function isRoundComplete(state: RoundContributionState[]): boolean {
  return state.every((s) => s.isBeneficiary || s.isPaid);
}
