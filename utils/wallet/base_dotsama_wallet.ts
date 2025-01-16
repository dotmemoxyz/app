import { formatAccount } from "@/utils/account";
import type { SubscriptionFn, Wallet, WalletConfig } from "./config";
import { createLogger } from "@/utils/create-logger";
import type { InjectedAccount, InjectedExtension } from "polkadot-api/pjs-signer";
import { connectInjectedExtension, getInjectedExtensions } from "polkadot-api/pjs-signer";

const DAPP_NAME = ".MEMO";

const logger = createLogger("wallet");

export class BaseDotsamaWallet implements Wallet {
  img = "";
  name = "";
  extensionName = "";
  source = "";
  walletUrl = "";
  guideUrl = "";
  isMobileApp = false;
  isBrowserExtension = false;

  constructor(config?: WalletConfig) {
    if (config) {
      this.img = config.img;
      this.name = config.name;
      this.extensionName = config.extensionName;
      this.source = config.source;
      this.walletUrl = config.walletUrl;
      this.guideUrl = config.guideUrl;
      this.isMobileApp = config.isMobileApp;
      this.isBrowserExtension = config.isBrowserExtension;
    }
  }
  sign?: ((address: string, payload: string) => unknown) | undefined;

  _extension: InjectedExtension | undefined;
  // API docs: https://polkadot.js.org/docs/extension/
  get extension() {
    return this._extension;
  }

  get installed() {
    const injectedExtensions = getInjectedExtensions();
    return injectedExtensions.some((extension) => extension === this.source);
  }

  enable = async () => {
    if (!this.installed) {
      return;
    }

    try {
      const extension = await connectInjectedExtension(this.source, DAPP_NAME);
      if (!extension) {
        return;
      }

      this._extension = extension;
    } catch (err) {
      logger.error("[ENABLE] Unable to enable :)");
    }
  };

  subscribeAccounts = async (callback: SubscriptionFn) => {
    if (!this._extension) {
      await this.enable();
    }

    if (!this._extension) {
      callback(undefined);
      return null;
    }
    if (!this._extension.subscribe) {
      return null;
    }
    const unsubscribe = this._extension.subscribe((accounts) => {
      const accountsWithWallet = this.accountMap(accounts);
      callback(accountsWithWallet);
    });
    return unsubscribe;
  };

  getAccounts = async (): Promise<ExtendedDotsamaAccount[] | null> => {
    if (!this._extension) {
      await this.enable();
    }

    if (!this._extension) {
      return null;
    }

    const accounts = this._extension.getAccounts();

    return this.accountMap(accounts);
  };

  getSubstrateAccounts = (accounts: InjectedAccount[]) =>
    accounts.filter((account) => isValidSubstrateAddress(account.address));

  accountMap = (accounts: InjectedAccount[]): ExtendedDotsamaAccount[] =>
    this.getSubstrateAccounts(accounts).map((account) => {
      account.address = formatAccount(account.address);
      return {
        ...account,
        source: this._extension?.name as string,
        // Added extra fields here for convenience
        wallet: this,
      };
    });
}

export type ExtendedDotsamaAccount = InjectedAccount & {
  source: string;
  wallet: BaseDotsamaWallet;
};
