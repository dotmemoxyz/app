import { CHAINS, NAMES } from "@kodadot1/static";

import type { ChainProperties, ChainVM, Prefix } from "@kodadot1/static";

export const chainPropListOf = (prefix: Prefix): ChainProperties => {
  return CHAINS[prefix];
};

export const vmOf = (prefix: Prefix): ChainVM => {
  return chainPropListOf(prefix).vm;
};

export const ss58Of = (prefix: Prefix): number => {
  return chainPropListOf(prefix).ss58Format;
};

export const blockExplorerOf = (prefix: Prefix): string | undefined => {
  return chainPropListOf(prefix).blockExplorer;
};

export const getChainName = (prefix: Prefix) => {
  return NAMES[prefix];
};

export const getTransactionFee = (prefix: Extract<Prefix, "ahp" | "ahk">) => {
  return prefix === "ahp" ? 0.002 : 0.0002;
};

type AssetItem = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
};

export const chainAssetOf = (prefix: Prefix): AssetItem => {
  const { tokenDecimals: decimals, tokenSymbol: symbol } = chainPropListOf(prefix);
  return {
    id: "0",
    name: symbol,
    symbol,
    decimals,
  };
};
