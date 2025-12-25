import type { Prefix } from "@kodadot1/static";

export type MemoCustomize = {
  image?: string;
  heading?: string;
  subheading?: string;
  claimText?: string;
  telegram?: string;
  instagram?: string;
  website?: string;
  darkMode?: boolean;
  accentColor?: string;
};

/**
 * Local MEMO object
 */
export type MemoPureDTO = {
  /**
   * Chain of the memo
   */
  chain: Prefix;
  /**
   * Collection ID of the memo
   */
  id: string;
  /**
   * Name of the memo
   */
  name: string;
  /**
   * Description of the memo
   */
  description: string;
  /**
   * Image URL
   */
  image: string;
  /**
   * IPFS Mint of the memo
   */
  mint: string;
  /**
   * Created at
   */
  createdAt: string;
  /**
   * Expires at
   */
  expiresAt: string;

  /**
   * Customization of the memo
   */
  customize: MemoCustomize;
};

export interface MemoDTO extends MemoPureDTO {
  /**
   * Code of the memo
   */
  code: string;
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
};

/**
 * Local MEMO object
 */
export type Memo = {
  /**
   * Chain of the memo
   */
  chain: Prefix;
  /**
   * Collection ID of the memo
   */
  id: string;
  /**
   * Name of the memo
   */
  name: string;
  /**
   * Description of the memo
   */
  description: string;
  /**
   * Image URL
   */
  image: string;
  /**
   * IPFS Mint of the memo
   */
  mint: string;
  /**
   * Created at
   */
  createdAt: string;
  /**
   * Expires at
   */
  expiresAt: string;

  /**
   * Customization of the memo
   */
  customize: MemoCustomize;
  /**
   * Rarity tiers configuration (only for owner)
   * undefined = tiers not configured/disabled
   */
  tiers?: TiersData;
  /**
   * Whether tiers are locked (claims exist)
   */
  tiersLocked?: boolean;
};

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

export interface MemoWithCode extends Memo {
  /**
   * Code of the memo
   */
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
