import type { Prefix } from "@kodadot1/static";
import { chainAssetOf } from "./chain.config";
import { formatBalance } from "dedot/utils";

/**
 * Formats a raw token amount (in smallest unit) to a human-readable string.
 * @param amount - The raw amount in smallest unit (e.g., planck for DOT)
 * @param prefix - The chain prefix to get decimals and symbol
 * @param options - Optional configuration object
 * @param options.withSymbol - Whether to include the currency symbol in output (default: true)
 * @returns Formatted string like "0.0100" or "0.0100 DOT" depending on withSymbol option
 */
export function formatAmount(amount: number | bigint, prefix: Prefix, { withSymbol = true } = {}): string {
  if (!amount) return "";
  const asset = chainAssetOf(prefix);
  return formatBalance(amount, {
    decimals: asset.decimals,
    symbol: withSymbol ? asset.symbol : undefined,
  });
}
