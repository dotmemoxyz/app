import type { ChainClient } from "@/utils/dedot/client";

export const MEMO_BOT = "E6eji2dKDtQ6irDmf6kbfEV1c7ZiRyMhFx6iyEijGXzcqWW";

export enum Fee {
  TX = 0.0033,
  DEPOSIT = 0.0351,
}

export const calculateFee = (amount: number, fee: Fee) => {
  return amount * fee;
};

export const collectionDeposit = (client: ChainClient) => BigInt(client.consts.nfts.collectionDeposit.toString());
export const itemDeposit = (client: ChainClient) => BigInt(client.consts.nfts.itemDeposit.toString());
export const metadataDeposit = (client: ChainClient) => BigInt(client.consts.nfts.metadataDepositBase.toString());
