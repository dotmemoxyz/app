import type { Prefix } from "@kodadot1/static";

export type Ownership = "created" | "organized" | "collected";

export type MemoCustomize = {
  image?: string;
  heading?: string;
  subheading?: string;
  claimText?: string;
  telegram?: string;
  instagram?: string;
  twitter?: string; // rename to x ?
  website?: string;
  darkMode?: boolean;
  accentColor?: string;
};

export type Memo = {
  /** Chain of the memo */
  chain: Prefix;
  /** Collection ID of the memo */
  id: string;
  /** Name of the memo */
  name: string;
  /** Description of the memo */
  description: string;
  /** Image URL */
  image: string;
  /** IPFS Mint of the memo */
  mint: string;
  /** Created at */
  createdAt: string;
  /** Expires at */
  expiresAt: string;
  /** Customization of the memo */
  customize: MemoCustomize;
  /** Number of pending email reservations */
  reservedCount?: number;
};

export interface MemoDTO extends Memo {
  code: string;
}

export interface ClaimCheckResponse {
  id: string;
  status: "pending" | "completed" | "failed";
  claimedAt: string;
  collectionId: string;
  itemId: string;
  transactionHash?: string;
}

export interface ClaimMemoResponse {
  success: boolean;
  message: string;
  chain: "ahk" | "ahp";
  collectionId: string;
  claimId: string;
  itemId: string;
  legacy: boolean;
}

/**
 * Uniquery collection format
 */
export type UniqCollection = {
  id: string;
  name: string;
  image: string;
  issuer: string;
  metadata: string;
  currentOwner: string;
  createdAt: string;
  meta?: {
    id: string;
    name: string;
    description: string;
    image: string;
    animationUrl: string;
    type: string;
  };
};

export type UniqItem = {
  id: string;
  name: string;
  image: string;
  metadata: string;
  collection: UniqCollection;
  currentOwner: string;
  createdAt: string;
};

/**
 * Full MEMO object for dashboard/detail view
 */
export interface MemoDetail extends Memo {
  code?: string;
  tiers?: TiersData;
  tiersLocked?: boolean;
  organizers?: string[];
  isOrganizer?: boolean;
  locationCountry?: string; // ISO 3166-1 alpha-2 country code
}

/**
 * Rarity tier definition
 */
export interface RarityTier {
  name: string;
  weight: number;
}

/**
 * Distribution mode for rarity tiers
 * - 'percentage': Weights represent percentages (must sum to 100)
 * - 'fixed': Weights represent absolute quantities (must sum to totalSupply)
 */
export type DistributionMode = "percentage" | "fixed";

/**
 * Rarity tiers configuration
 * Note: The presence of TiersData indicates tiers are enabled.
 * If tiers are disabled, the value should be undefined instead.
 */
export interface TiersData {
  distributionMode: DistributionMode;
  tiers: RarityTier[];
}

export interface MemoWithCode extends MemoDetail {
  code: string;
}

export type CreateMemoDTO = {
  /**
   * Secret of the memo
   */
  secret: string;
  /**
   * Mint of the memo
   */
  mint: string;
  /**
   * Collection ID of the memo
   */
  collection: number;
  /**
   * Chain of the memo
   */
  chain: Prefix;
  /**
   * Name of the memo
   */
  name: string;
  /**
   * Image URL
   */
  image: string;
  /**
   * Expires at
   */
  expiresAt: string;
  /**
   * Created at
   */
  createdAt: string;
  /**
   * Creator of the memo
   */
  creator: string;
};
