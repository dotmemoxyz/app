export enum SupportWalletExtension {
  PolkadotJs = "polkadot-js",
  MetaMask = "metamask",
  Clover = "clover",
  Ledger = "ledger",
  Math = "mathwallet",
  Nova = "nova-wallet",
  SubWallet = "subwallet-js",
  Talisman = "talisman",
  Enkrypt = "enkrypt",
  PolkaGate = "polkagate",
}

export interface WalletConfig {
  img: string;
  extensionName: SupportWalletExtension;
  source: SupportWalletExtension;
  name: string;
  walletUrl: string;
  guideUrl: string;
  isBrowserExtension: boolean;
  isMobileApp: boolean;
}

export type IWalletConfigMap = Partial<Record<SupportWalletExtension, WalletConfig>>;

export const WalletExtensionProxyMap = {
  [SupportWalletExtension.Math]: SupportWalletExtension.PolkadotJs, // mathwallet
  // [SupportWalletExtension.Nova]: SupportWalletExtension.PolkadotJs, // nova
} as Record<SupportWalletExtension, SupportWalletExtension | undefined>;

export type SubscriptionFn = (accounts: WalletAccount[] | undefined) => void | Promise<void>;

export interface WalletAccount {
  address: string;
  source: string;
  name?: string;
  wallet?: Wallet;
  signer?: unknown;
}

interface WalletData {
  extensionName: string;
  source: string;
  name: string;
  walletUrl: string;
  guideUrl: string;
  img: string;
  isBrowserExtension: boolean;
  isMobileApp: boolean;
}

interface WalletExtension {
  installed: boolean | undefined;

  // The raw extension object which will have everything a dapp developer needs.
  // Refer to a specific wallet's extension documentation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extension: any;

  // The raw signer object for convenience. Usually the implementer can derive this from the extension object.
  // Refer to a specific wallet's extension documentation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: any;
}

interface Signer {
  // Sign function
  sign?: (address: string, payload: string) => unknown;
}

interface Connector {
  enable: () => unknown;

  // The subscribe to accounts function
  subscribeAccounts: (callback: SubscriptionFn) => unknown;
}

export interface Wallet extends WalletData, WalletExtension, Connector, Signer {}

const getWalletExtensionSource = (walletExtension: SupportWalletExtension): SupportWalletExtension => {
  return WalletExtensionProxyMap[walletExtension] || walletExtension;
};

const buildWalletConfig = (
  walletExtension: SupportWalletExtension,
  img: string,
  name: string,
  walletUrl: string,
  guideUrl: string,
  isBrowserExtension = false,
  isMobileApp = false,
): WalletConfig => ({
  img,
  name,
  extensionName: walletExtension,
  source: getWalletExtensionSource(walletExtension),
  walletUrl,
  guideUrl,
  isBrowserExtension,
  isMobileApp,
});

export const WalletConfigMap: IWalletConfigMap = {
  [SupportWalletExtension.PolkadotJs]: buildWalletConfig(
    SupportWalletExtension.PolkadotJs,
    "/wallets/logo-polkadot-js.webp",
    "Polkadot.js",
    "https://polkadot.js.org/extension/",
    "https://www.youtube.com/watch?v=r-fAy7Ta_vY",
    true,
  ),
  [SupportWalletExtension.Clover]: buildWalletConfig(
    SupportWalletExtension.Clover,
    "/wallets/logo-clover.webp",
    "CLV Wallet",
    "https://chrome.google.com/webstore/detail/clv-wallet/nhnkbkgjikgcigadomkphalanndcapjk",
    "https://docs.clv.org/use-clv-wallet/clv-extension-wallet",
    true,
  ),
  [SupportWalletExtension.Ledger]: buildWalletConfig(
    SupportWalletExtension.Ledger,
    "/wallets/logo-ledger.svg",
    "Ledger",
    "https://www.ledger.com/ledger-live",
    "https://www.ledger.com/ledger-live",
  ),
  [SupportWalletExtension.Math]: buildWalletConfig(
    SupportWalletExtension.Math,
    "/wallets/logo-mathwallet.webp",
    "Math Wallet",
    "https://mathwallet.org/en-us/",
    "https://blog.mathwallet.org/?p=540",
    false,
    true,
  ),
  [SupportWalletExtension.Nova]: buildWalletConfig(
    SupportWalletExtension.Nova,
    "/wallets/logo-nova.webp",
    "Nova",
    "https://novawallet.io/",
    "https://novawallet.io/",
    false,
    true,
  ),
  [SupportWalletExtension.SubWallet]: buildWalletConfig(
    SupportWalletExtension.SubWallet,
    "/wallets/logo-subwallet.svg",
    "SubWallet",
    "https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0",
    "https://connect.subwallet.app/#/welcome",
    true,
    true,
  ),
  [SupportWalletExtension.Talisman]: buildWalletConfig(
    SupportWalletExtension.Talisman,
    "/wallets/logo-talisman.svg",
    "Talisman",
    "https://app.talisman.xyz/spiritkeys",
    "https://app.talisman.xyz/",
    true,
  ),
  [SupportWalletExtension.Enkrypt]: buildWalletConfig(
    SupportWalletExtension.Enkrypt,
    "/wallets/logo-enkrypt.webp",
    "Enkrypt",
    "https://www.enkrypt.com/#downloads",
    "https://www.enkrypt.com/",
    true,
  ),
  [SupportWalletExtension.PolkaGate]: buildWalletConfig(
    SupportWalletExtension.PolkaGate,
    "/wallets/logo-polkagate.svg",
    "PolkaGate",
    "https://chromewebstore.google.com/detail/polkagate-the-gateway-to/ginchbkmljhldofnbjabmeophlhdldgp?hl=en",
    "https://polkagate.xyz/",
    true,
  ),
};

export const MobileWalletExtensionList = [
  SupportWalletExtension.Nova,
  SupportWalletExtension.SubWallet,
  SupportWalletExtension.Math,
];
export const PCWalletExtensionList = [
  SupportWalletExtension.Talisman,
  SupportWalletExtension.SubWallet,
  SupportWalletExtension.PolkadotJs,
  SupportWalletExtension.PolkaGate,
  SupportWalletExtension.Enkrypt,
  SupportWalletExtension.Clover,
];
