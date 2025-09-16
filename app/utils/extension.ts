import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getWalletBySource } from "./wallet";

export const enableExtension = async () => await web3Enable("DotMemo");

export const getInjectedExtensions = async () => {
  const extensions = await web3Enable("DotMemo");
  return extensions;
};

export const getAddress = async (address: string) => {
  try {
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

export const isMobileDevice = "ontouchstart" in document.documentElement && /Mobi/.test(navigator.userAgent);
