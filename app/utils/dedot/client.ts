import { DedotClient, WsProvider } from "dedot";
import type { PolkadotAssetHubApi } from "@dedot/chaintypes";

export type ChainClient = DedotClient<PolkadotAssetHubApi>;

type ClientCacheEntry = {
  client: ChainClient | null;
  connectionPromise: Promise<ChainClient>;
};

const clientCache = new Map<string, ClientCacheEntry>();
const connectionCallbacks = new Map<string, Set<(client: ChainClient) => void>>();

export async function getClient(endpoint: string): Promise<ChainClient> {
  const cached = clientCache.get(endpoint);
  if (cached) {
    return cached.connectionPromise;
  }

  const connectionPromise = createClient(endpoint);

  clientCache.set(endpoint, {
    client: null,
    connectionPromise,
  });

  const client = await connectionPromise;
  clientCache.set(endpoint, { client, connectionPromise: Promise.resolve(client) });

  const callbacks = connectionCallbacks.get(endpoint);
  if (callbacks) {
    callbacks.forEach((cb) => cb(client));
  }

  return client;
}

async function createClient(endpoint: string): Promise<ChainClient> {
  const provider = new WsProvider(endpoint);
  const client = await DedotClient.new<PolkadotAssetHubApi>({ provider, cacheMetadata: true });
  return client;
}

export function onClientConnect(endpoint: string, callback: (client: ChainClient) => void): () => void {
  const cached = clientCache.get(endpoint);
  if (cached?.client) {
    callback(cached.client);
    return () => {};
  }

  if (!connectionCallbacks.has(endpoint)) {
    connectionCallbacks.set(endpoint, new Set());
  }
  connectionCallbacks.get(endpoint)!.add(callback);

  getClient(endpoint);

  return () => {
    connectionCallbacks.get(endpoint)?.delete(callback);
  };
}

export async function disconnectClient(endpoint: string): Promise<void> {
  const cached = clientCache.get(endpoint);
  if (cached?.client) {
    await cached.client.disconnect();
    clientCache.delete(endpoint);
    connectionCallbacks.delete(endpoint);
  }
}

export function isClientConnected(endpoint: string): boolean {
  return clientCache.has(endpoint) && clientCache.get(endpoint)?.client !== null;
}
