export interface Candidate {
  id: string;
  name: string;
  symbol: string; // base64 image or emoji fallback
  party: string;
  votes: number;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: "setup" | "active" | "ended";
  controlPassword: string;
  candidates: Candidate[];
  studentIds: string[];
  votedStudentIds: string[];
  createdAt: string;
  endedAt?: string;
}

export interface AdminCredentials {
  adminId: string;
  password: string;
}

export type UserRole = "officer" | "teacher" | "none";

export interface AppState {
  role: UserRole;
  election: Election | null;
  evmUnlocked: boolean;
}