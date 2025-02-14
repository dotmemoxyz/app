import { getSupportedWallets } from "~/utils/wallet";

const logger = createLogger("middleware:user.global");
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;
  const accountStore = useAccountStore();
  if (accountStore.hasSelectedAccount) {
    return;
  }
  const accountAddress = localStorage.getItem("account-address");
  const accountWallet = localStorage.getItem("account-wallet");
  if (accountAddress && accountWallet) {
    const wallets = getSupportedWallets();
    const installedWallets = wallets.filter((wallet) => wallet.installed);
    const wallet = installedWallets.find((wallet) => wallet.name === accountWallet);
    if (!wallet) {
      return;
    }
    try {
      const accounts = await wallet.getAccounts();
      if (!accounts) {
        return;
      }
      const account = accounts.find((acc) => acc.address === accountAddress);
      if (account) {
        accountStore.selectAccount(account);
      }
    } catch (e) {
      logger.error(e);
    }
  }
});
