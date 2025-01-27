import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export type Account = InjectedAccountWithMeta;

export type AssetItem = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
};
