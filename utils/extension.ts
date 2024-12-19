import { getWalletBySource } from "./wallet";
import type { InjectedExtension } from "polkadot-api/pjs-signer";

export const getAddress = async (address: string): Promise<InjectedExtension | null> => {
  try {
    const walletName = useAccountStore().selected?.wallet.source;
    const wallet = getWalletBySource(walletName);
    await wallet?.enable();
    return wallet?.extension ?? null;
  } catch (e) {
    console.warn(`[EXTENSION] No Addr ${address}`);
    return null;
  }
};

export const isMobileDevice = "ontouchstart" in document.documentElement && /Mobi/.test(navigator.userAgent);
