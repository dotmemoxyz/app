import { BaseDotsamaWallet } from "./base_dotsama_wallet";
import { isMobileDevice } from "~/utils/extension";
import {
  MobileWalletExtensionList,
  PCWalletExtensionList,
  type SupportWalletExtension,
  WalletConfigMap,
  type Wallet,
} from "./config";

const createWalletInstance = (walletExtension: SupportWalletExtension): BaseDotsamaWallet => {
  const config = WalletConfigMap[walletExtension];
  return new BaseDotsamaWallet(config);
};

const createWalletInstanceList = (walletList: SupportWalletExtension[]): BaseDotsamaWallet[] => {
  return walletList.map((walletExtension) => createWalletInstance(walletExtension));
};

export const getSupportedWallets = () => {
  if (isMobileDevice) {
    return createWalletInstanceList(MobileWalletExtensionList);
  }
  const allWallets = createWalletInstanceList(PCWalletExtensionList);
  const wallets = allWallets.filter((wallet) => wallet.installed);
  const sourceIds = new Set(wallets.map((d) => d.source));
  const allWalletsUpdates = [...wallets, ...allWallets.filter((d) => !sourceIds.has(d.source))];
  return allWalletsUpdates;
};

export function getWalletBySource(source: string | unknown): Wallet | undefined {
  return getSupportedWallets().find((wallet) => {
    return wallet.extensionName === source;
  });
}
