import type { ChainClient } from "@/utils/dedot/client";

const logger = createLogger("Utils/SDK/Query");

export async function nextCollectionId(client: ChainClient) {
  try {
    const result = await client.query.nfts.nextCollectionId();
    return result ?? null;
  } catch (error) {
    logger.error("Error getting collection id", error);
    return null;
  }
}

export async function getFreeMints(client: ChainClient, collectionId: number) {
  const collectionInfo = await client.query.nfts.collection(collectionId);
  const configInfo = await client.query.nfts.collectionConfigOf(collectionId);

  if (collectionInfo && configInfo) {
    const maxTokens = configInfo.maxSupply ?? null;
    const mintedTokens = collectionInfo.items;
    const remainingMints = maxTokens !== null ? maxTokens - mintedTokens : null;

    return {
      maxTokens,
      mintedTokens,
      remainingMints,
    };
  } else {
    throw new Error("Collection not found");
  }
}

export async function latestBlock(client: ChainClient) {
  try {
    const result = await client.rpc.chain_getHeader();
    return result?.number ?? null;
  } catch (error) {
    logger.error("Error getting latest block", error);
    return null;
  }
}
