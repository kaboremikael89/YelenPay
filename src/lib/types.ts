export type TontineStatus = "active" | "completed" | "paused";
export type ContributionStatus = "pending" | "paid";
export type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Tontine {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  frequency: Frequency;
  max_members: number;
  status: TontineStatus;
  current_round: number;
  created_by: string;
  created_at: string;
}

export interface TontineMember {
  id: string;
  tontine_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  position: number;
  created_at: string;
}

export interface Contribution {
  id: string;
  tontine_id: string;
  round: number;
  member_id: string;
  amount: number;
  status: ContributionStatus;
  payment_token: string | null;
  paid_at: string | null;
  created_at: string;
}
