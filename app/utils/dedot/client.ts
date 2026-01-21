import { LocalStorage, type IStorage } from "@dedot/storage";
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
  const cacheStorage = getCacheStorage();
  const client = await DedotClient.new<PolkadotAssetHubApi>({
    provider,
    // Use legacy RPC to avoid ChainHead (RPC v2) crashes from flaky public endpoints emitting
    // malformed block events. Legacy path is more stable but lacks v2 ChainHead features.
    // Revisit if endpoints stabilize or Dedot fixes the v2 handler.
    rpcVersion: "legacy",
    cacheMetadata: true,
    cacheStorage,
  });
  return client;
}

function getCacheStorage(): IStorage {
  if (import.meta.client) {
    try {
      return new LocalStorage();
    } catch {
      // fall through to memory storage
    }
  }

  const store = new Map<string, string>();

  return {
    async get(key) {
      return store.get(key) ?? null;
    },
    async set(key, value) {
      store.set(key, value);
      return value;
    },
    async remove(key) {
      store.delete(key);
    },
    async clear() {
      store.clear();
    },
    async length() {
      return store.size;
    },
    async keys() {
      return Array.from(store.keys());
    },
  };
}
