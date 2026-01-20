import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import type { Prefix as PolkadotPrefix } from "@polkadot/util-crypto/types";
import type { Prefix } from "@kodadot1/static";

export const toDefaultAddress = (address: string) => {
  // const address = accountToAddress(account)
  if (/^5/.test(address)) {
    return address;
  }
  return encodeAddress(address);
};

export const formatAddress = (address: string, ss58Format: number) => encodeAddress(address, ss58Format);

export const formatAddressByPrefix = (address: string, prefix: Prefix) =>
  encodeAddress(decodeAddress(address), prefix === "ahp" ? 0 : 2);

const accountToAddress = (account: KeyringAccount | string) =>
  typeof account === "string" ? account : account.address;

export const formatAccount = (account: KeyringAccount | string, format?: PolkadotPrefix) => {
  const address = accountToAddress(account);
  const chainStore = useChainStore();
  const ss58Format = format ? format : chainStore.getChainProperties58Format;
  return encodeAddress(decodeAddress(address), ss58Format);
};

export const reencodeAddress = (address: string, format: PolkadotPrefix) =>
  encodeAddress(decodeAddress(address), format);

export const isValidSubstrateAddress = (address: string): boolean => {
  try {
    encodeAddress(decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
};

export const addressShortener = (address: string, startOffset = 6, endOffset = -4): string => {
  return `${address.slice(0, startOffset)}...${address.slice(endOffset)}`;
};
