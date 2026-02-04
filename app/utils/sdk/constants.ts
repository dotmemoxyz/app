import type { ChainClient } from "@/utils/dedot/client";

export const MEMO_BOT = "E6eji2dKDtQ6irDmf6kbfEV1c7ZiRyMhFx6iyEijGXzcqWW";
export const getMemoBotAddress = () => {
  const config = useRuntimeConfig();
  return config.public?.memoBotAddress || MEMO_BOT;
};

export enum Fee {
  TX = 0.0033,
  DEPOSIT = 0.0351,
}

export const calculateFee = (amount: number, fee: Fee) => {
  return amount * fee;
};

export const collectionDeposit = (client: ChainClient) => client.consts.nfts.collectionDeposit;
export const itemDeposit = (client: ChainClient) => client.consts.nfts.itemDeposit;
export const metadataDeposit = (client: ChainClient) => client.consts.nfts.metadataDepositBase;
