import "@polkadot/api-augment";
import type { ApiPromise } from "@polkadot/api";
import { createLogger } from "~~/utils/create-logger";

const logger = createLogger("Utils/SDK/Query");

export async function nextCollectionId(api: ApiPromise) {
  try {
    const result = await api.query.nfts.nextCollectionId();

    return result.unwrap().toNumber();
  } catch (error) {
    logger.error("Error getting collection id", error);
    return null;
  }
}

export async function latestBlock(api: ApiPromise) {
  try {
    const result = await api.rpc.chain.getHeader();

    return result.number.toNumber();
  } catch (error) {
    logger.error("Error getting latest block", error);
    return null;
  }
}
