import type { Prefix } from "@kodadot1/static";

export type MemoDTO = {
  id: string;
  chain: Prefix;
  collection: string;
  table_ref: string;
  created_at: string;
  name: string;
  image: string;
  mint: string;
  description?: string;
  password: string | null;
  expires_at: string;
};

export type Memo = {
  /**
   * Code of the memo
   */
  id: string;
  /**
   * Chain of the memo
   */
  chain: Prefix;
  /**
   * Collection ID of the memo
   */
  collection: string;
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
   * Flag to enable / disable claim by mail
   */
  supportMail: boolean;
};

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
  collection: string;
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
   * Flag to enable / disable claim by mail
   */
  supportMail: boolean;
};
