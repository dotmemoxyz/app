import type { MemoCustomize } from "./memo";
import type { Prefix } from "@kodadot1/static";

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

export type EmailClaimStatus = "pending" | "claimed" | "expired";

export interface EmailClaimDetails {
  email: string;
  memoName: string;
  memoImage: string;
  memoDescription: string;
  chain: Prefix;
  collectionId: string;
  itemId: number;
  createdAt: string;
  expiresAt: string;
  status: EmailClaimStatus;
  customize: MemoCustomize;
  reservedCount?: number;
}

export interface FinalizeClaimRequest {
  address: string;
}

export interface FinalizeClaimResponse {
  chain: string;
  collectionId: string;
  itemId: string;
  claimId: string;
}

export interface CheckPreviousEmailResponse {
  hasPreviousClaim: boolean;
  email?: string;
  walletAddress?: string;
  hasClaimedThisMemo?: boolean;
  claimStatus?: EmailClaimStatus;
}
