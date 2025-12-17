import type { MemoCustomize } from "./memo";

export interface InitiateEmailRequest {
  email: string;
  code: string;
}

export interface InitiateEmailResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  claimToken: string;
  memoCode: string;
}

export interface EmailClaimDetails {
  email: string;
  memoName: string;
  memoImage: string;
  memoDescription: string;
  chain: string;
  collectionId: string;
  itemId: number;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "claimed" | "expired";
  customize: MemoCustomize;
  reservedCount?: number;
}

export interface FinalizeClaimRequest {
  address: string;
}

export interface FinalizeClaimResponse {
  chain: string;
  collection: string;
  sn: string;
}

export interface CheckPreviousEmailResponse {
  hasPreviousClaim: boolean;
  email?: string;
  walletAddress?: string;
  hasClaimedThisMemo?: boolean;
  claimStatus?: "pending" | "claimed" | "expired";
}
