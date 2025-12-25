import type { Prefix } from "@kodadot1/static";
import { chainAssetOf } from "./chain.config";

/**
 * Formats a raw token amount (in smallest unit) to a human-readable string with symbol.
 * @param amount - The raw amount in smallest unit (e.g., planck for DOT)
 * @param prefix - The chain prefix to get decimals and symbol
 * @param decimals - Optional precision for decimal places (default: 4)
 * @returns Formatted string like "0.0100 DOT"
 */
export function formatAmount(amount: number | bigint, prefix: Prefix, decimals: number = 4): string {
  if (!amount) return "";
  const asset = chainAssetOf(prefix);
  const formatted = (Number(amount) / Math.pow(10, asset.decimals)).toFixed(decimals);
  return `${formatted} ${asset.symbol}`;
}
