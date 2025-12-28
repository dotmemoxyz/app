import { getWalletBySource } from "./wallet";

export const getAddress = async (address: string) => {
  if (import.meta.server) return null;
  try {
    const { web3FromAddress } = await import("@polkadot/extension-dapp");
    const walletName = useAccountStore().selected?.wallet.source;
    const wallet = getWalletBySource(walletName);
    await wallet?.enable();
    if (wallet?.extension) {
      return wallet.extension;
    }

    const injector = await web3FromAddress(address);
    return injector;
  } catch (e) {
    console.warn(`[EXTENSION] No Addr ${address}`);
    return null;
  }
};

export const isMobileDevice =
  import.meta.client && "ontouchstart" in document.documentElement && /Mobi/.test(navigator.userAgent);
