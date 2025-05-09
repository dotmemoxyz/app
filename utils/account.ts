import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import type { Prefix } from "@polkadot/util-crypto/types";

export const toDefaultAddress = (address: string) => {
  // const address = accountToAddress(account)
  if (/^5/.test(address)) {
    return address;
  }
  return encodeAddress(address);
};

export const formatAddress = (address: string, ss58Format: number) => encodeAddress(address, ss58Format);

const accountToAddress = (account: KeyringAccount | string) =>
  typeof account === "string" ? account : account.address;

export const formatAccount = (account: KeyringAccount | string, format?: Prefix) => {
  const address = accountToAddress(account);
  const chainStore = useChainStore();
  const ss58Format = format ? format : chainStore.getChainProperties58Format;
  return encodeAddress(decodeAddress(address), ss58Format);
};

export const reencodeAddress = (address: string, format: Prefix) => encodeAddress(decodeAddress(address), format);

export const isValidSubstrateAddress = (address: string): boolean => {
  try {
    encodeAddress(decodeAddress(address));
    return true;
  } catch (error) {
    return false;
  }
};
