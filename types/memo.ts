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
};

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
