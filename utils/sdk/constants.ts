import type { ApiPromise } from "@polkadot/api";

export const MEMO_BOT = "Gn84LKb5HSxc3SACayxCzKQcWESRMcT1VUCqeZURfGj6ASi";

export enum Fee {
  TX = 0.0033,
  DEPOSIT = 0.0351,
}

export const calculateFee = (amount: number, fee: Fee) => {
  return amount * fee;
};

export const collectionDeposit = (api: ApiPromise) => api.consts.nfts.collectionDeposit.toNumber();
export const itemDeposit = (api: ApiPromise) => api.consts.nfts.itemDeposit.toNumber();
export const metadataDeposit = (api: ApiPromise) => api.consts.nfts.metadataDepositBase.toNumber();
