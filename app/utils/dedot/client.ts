import { DedotClient, WsProvider } from "dedot";
import type { PolkadotAssetHubApi } from "@dedot/chaintypes";

export type ChainClient = DedotClient<PolkadotAssetHubApi>;

type ClientCacheEntry = {
  client: ChainClient | null;
  connectionPromise: Promise<ChainClient>;
};

const clientCache = new Map<string, ClientCacheEntry>();

export async function getClient(endpoint: string | string[]): Promise<ChainClient> {
  const cacheKey = Array.isArray(endpoint) ? endpoint.join(",") : endpoint;
  const cached = clientCache.get(cacheKey);
  if (cached) {
    return cached.connectionPromise;
  }

  const connectionPromise = createClient(endpoint);

  clientCache.set(cacheKey, {
    client: null,
    connectionPromise,
  });

  try {
    const client = await connectionPromise;
    clientCache.set(cacheKey, { client, connectionPromise: Promise.resolve(client) });
    return client;
  } catch (error) {
    clientCache.delete(cacheKey);
    throw error;
  }
}

async function createClient(endpoints: string | string[]): Promise<ChainClient> {
  const provider = new WsProvider(endpoints);
  const client = await DedotClient.new<PolkadotAssetHubApi>({ provider, cacheMetadata: true });
  return client;
}
