import "@polkadot/api-augment";
import type { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";

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

export async function getFreeMints(api: ApiPromise, collectionId: string) {
  const collectionInfo = await api.query.nfts.collection(collectionId);
  const configInfo = await api.query.nfts.collectionConfigOf(collectionId);

  if (collectionInfo.isSome && configInfo.isSome) {
    const collection = collectionInfo.unwrap();
    const config = configInfo.unwrap();

    // Get max tokens
    const maxTokens = new BN(config.maxSupply.toString());

    // Get minted tokens
    const mintedTokens = new BN(collection.items.toString());

    // Calculate remaining mints
    const remainingMints = maxTokens.sub(mintedTokens);

    return {
      maxTokens: maxTokens.toNumber(),
      mintedTokens: mintedTokens.toNumber(),
      remainingMints: remainingMints.toNumber(),
    };
  } else {
    throw new Error("Collection not found");
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
