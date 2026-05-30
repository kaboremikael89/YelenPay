import type { Contribution, Profile, Tontine, TontineMember } from "./types";

/**
 * Mode démo : activé quand `NEXT_PUBLIC_DEMO=1` (ou quand Supabase n'est pas
 * configuré). Permet de déployer une version vitrine sans backend ni compte,
 * avec des données d'exemple, pour visualiser l'application.
 */
export const DEMO =
  process.env.NEXT_PUBLIC_DEMO === "1" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const demoUser = {
  id: "demo-user",
  email: "demo@yelenpay.sn",
};

export const demoProfile: Profile = {
  id: "demo-user",
  full_name: "Awa Demo",
  phone: "+221 77 123 45 67",
  created_at: new Date().toISOString(),
};

export const demoTontines: Tontine[] = [
  {
    id: "t1",
    name: "Tontine du marché Sandaga",
    description: "Commerçantes du marché, cotisation mensuelle.",
    amount: 25000,
    frequency: "monthly",
    max_members: 5,
    status: "active",
    current_round: 2,
    created_by: "demo-user",
    created_at: new Date().toISOString(),
  },
  {
    id: "t2",
    name: "Tontine familiale Keur Massar",
    description: "Épargne familiale pour la Tabaski.",
    amount: 50000,
    frequency: "monthly",
    max_members: 4,
    status: "active",
    current_round: 1,
    created_by: "demo-user",
    created_at: new Date().toISOString(),
  },
];

const membersByTontine: Record<string, TontineMember[]> = {
  t1: [
    "Awa Demo",
    "Moussa Fall",
    "Fatou Ndiaye",
    "Cheikh Sow",
    "Mariama Ba",
  ].map((name, i) => ({
    id: `t1-m${i + 1}`,
    tontine_id: "t1",
    user_id: i === 0 ? "demo-user" : null,
    name,
    phone: null,
    position: i + 1,
    created_at: new Date().toISOString(),
  })),
  t2: ["Awa Demo", "Ibrahima Diallo", "Aminata Sy", "Oumar Gueye"].map(
    (name, i) => ({
      id: `t2-m${i + 1}`,
      tontine_id: "t2",
      user_id: i === 0 ? "demo-user" : null,
      name,
      phone: null,
      position: i + 1,
      created_at: new Date().toISOString(),
    }),
  ),
};

// Pour t1, tour 2 : bénéficiaire = position 2 (Moussa). Les autres cotisent.
const contributionsByTontine: Record<string, Contribution[]> = {
  t1: [
    { member: "t1-m1", status: "paid" },
    { member: "t1-m3", status: "paid" },
    { member: "t1-m4", status: "pending" },
    { member: "t1-m5", status: "pending" },
  ].map((c, i) => ({
    id: `t1-c${i + 1}`,
    tontine_id: "t1",
    round: 2,
    member_id: c.member,
    amount: 25000,
    status: c.status as Contribution["status"],
    payment_token: null,
    paid_at: c.status === "paid" ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
  })),
  t2: [
    { member: "t2-m2", status: "pending" },
    { member: "t2-m3", status: "pending" },
    { member: "t2-m4", status: "pending" },
  ].map((c, i) => ({
    id: `t2-c${i + 1}`,
    tontine_id: "t2",
    round: 1,
    member_id: c.member,
    amount: 50000,
    status: c.status as Contribution["status"],
    payment_token: null,
    paid_at: null,
    created_at: new Date().toISOString(),
  })),
};

export function getDemoTontine(id: string): Tontine | null {
  return demoTontines.find((t) => t.id === id) ?? null;
}

export function getDemoMembers(id: string): TontineMember[] {
  return membersByTontine[id] ?? [];
}

export function getDemoContributions(id: string): Contribution[] {
  return contributionsByTontine[id] ?? [];
}
