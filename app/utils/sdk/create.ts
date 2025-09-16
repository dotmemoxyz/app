import type { ApiPromise } from "@polkadot/api";
import { nextCollectionId } from "./query";
import { MEMO_BOT } from "./constants";
import { asBalanceTransferAlive, type Extrinsic } from "@kodadot1/sub-api";

/** @name PalletNftsCollectionConfig (356) */
interface PalletNftsCollectionConfig {
  readonly settings: number;
  readonly maxSupply?: number;
  readonly mintSettings: PalletNftsMintSettings;
}
/** @name PalletNftsCollectionSetting (358) */

/** @name PalletNftsMintSettings (359) */
interface PalletNftsMintSettings {
  readonly mintType: { Issuer: null } | { Public: null } | { HolderOf: number };
  readonly price?: number;
  readonly startBlock?: number;
  readonly endBlock?: number;
  readonly defaultItemSettings: number;
}

export function createArgsForNftPallet(account: string, maxSupply?: number): [string, PalletNftsCollectionConfig] {
  const config = {
    settings: 0,
    maxSupply,
    mintSettings: {
      mintType: { Issuer: null },
      defaultItemSettings: 0,
    },
  };
  return [account, config];
}

export const createCollection = (api: ApiPromise, owner: string) => {
  const args = createArgsForNftPallet(owner);
  const create = api.tx.nfts.create(...args);
  return create;
};

export const setMaxSupply = (api: ApiPromise, collectionId: string, metadata: string) => {
  const set = api.tx.nfts.setCollectionMetadata(collectionId, metadata);
  return set;
};

// * - `issuer`: The new Issuer of this collection.
// * - `admin`: The new Admin of this collection.
// * - `freezer`: The new Freezer of this collection.
type Team = {
  isssuer: string;
  admin: string;
  freezer: string;
};
export const setTeam = (api: ApiPromise, collectionId: string, team: Team) => {
  const set = api.tx.nfts.setTeam(collectionId, team.isssuer, team.admin, team.freezer);
  return set;
};

export const setCollectionMetadata = (api: ApiPromise, collectionId: string, maxSupply: string | number | bigint) => {
  const set = api.tx.nfts.setCollectionMaxSupply(collectionId, maxSupply);
  return set;
};

export const buildBatch = (api: ApiPromise, calls: Extrinsic[]) => {
  const batch = api.tx.utility.batchAll(calls);
  return batch;
};

export const transferUs = (api: ApiPromise, amount: number) => {
  // const txFee = calculateFee(amount, Fee.TX);
  // const depositFee = calculateFee(amount, Fee.DEPOSIT);
  const transfer = asBalanceTransferAlive(api, MEMO_BOT, amount);
  return transfer;
};

export const buildMemo = async (api: ApiPromise, account: string, max: number) => {
  const nextId = await nextCollectionId(api);
  if (!nextId) {
    throw new Error("Could not get next collection id");
  }
  // eslint-disable-next-line no-console
  console.log("nextId", nextId.toString());
  const create = createCollection(api, account);
  const setMax = setMaxSupply(api, nextId.toString(), String(max));
  // const
  // const metadata = setCollectionMetadata(api, nextId.toString(), );
  // const team = setTeam(api, nextId.toString(), {
  //   isssuer: account,
  //   admin: account,
  //   freezer: account,
  // });
  return [create, setMax];
};
