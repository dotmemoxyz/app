import { $obtain } from "@kodadot1/minipfs";
import { sanitizeIpfsUrl } from "~/utils/ipfs";
import { getClient } from "@kodadot1/uniquery";
import type { Memo, UniqCollection } from "~/types/memo";
import type { Prefix } from "@kodadot1/static";
import { FetchError } from "ofetch";
import type { Metadata } from "~/services/nftStorage";
import { toDefaultAddress } from "~/utils/account";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { chain, address } = getRouterParams(event);

  if (!chain || !address) {
    throw createError({
      statusCode: 400,
      message: "Chain and address parameters are required",
    });
  }

  const genericAddress = toDefaultAddress(address);

  const [rawData, err] = await $fetch<Memo[]>(`${config.apiUrl}/memos/user/${chain}/${genericAddress}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    if (err instanceof FetchError) {
      if (err.statusCode === 404) {
        return [];
      }
      if (err.statusCode === 400) {
        throw createError({
          statusCode: 400,
          message: "Invalid request parameters",
        });
      }
    }
    console.error("[API::USER_MEMOS]", err);
    throw createError({
      statusCode: 500,
      message: `[API::USER_MEMOS] Failed to fetch user memos: ${err.message || "Unknown error"}`,
    });
  }

  const res: Memo[] = [];

  for (const memo of rawData || []) {
    if (!memo.image) continue;

    let image: string | null = null;
    try {
      image = sanitizeIpfsUrl(memo.image) ?? null;
    } catch (error) {
      console.warn(`[API::USER_MEMOS] Failed to sanitizeIpfsUrl image for memo ${memo.id}`, error);
    }

    if (!image) continue;

    let description = memo.description;
    if (!description && memo.mint) {
      try {
        const meta = await $obtain<Metadata>(sanitizeIpfsUrl(memo.mint));
        description = meta?.description || "";
      } catch (error) {
        console.warn(`[API::USER_MEMOS] Failed to fetch metadata for memo ${memo.id} - using empty description`, error);
      }
    }

    res.push({ ...memo, image, description: description || "" } as Memo);
  }

  // Fetch POAP memos from the indexer
  try {
    const indexerClient = getClient(chain as Prefix);
    const customQuery = {
      query: `
                query($address: String!) {
                    collections: collectionEntities(where: {
                        kind_eq: poap,
                        nfts_some: { currentOwner_eq: $address }
                    }) {
                        id
                        name
                        image
                        metadata
                        createdAt
                        issuer
                        meta {
                            id
                            name
                            description
                            image
                            animationUrl
                            type
                        }
                    }
                }
            `,
      variables: { address },
    };
    const collectionsResult = await indexerClient.fetch<{ collections: UniqCollection[] }>(customQuery);

    if (collectionsResult?.data?.collections) {
      const existingIds = new Set(res.map((memo) => memo.id));
      const poapMemos = await Promise.all(
        collectionsResult.data.collections.map(async (collection) => {
          try {
            const poapMemo: Memo = {
              chain: chain as Prefix,
              id: collection.id,
              name: collection.name || `Collection ${collection.id}`,
              description: collection.meta?.description || "",
              image: sanitizeIpfsUrl(collection.image) || "",
              mint: collection.metadata,
              createdAt: collection.createdAt,
              expiresAt: new Date().toISOString(),
              customize: {},
            };

            if (existingIds.has(poapMemo.id)) return null;

            existingIds.add(poapMemo.id);

            return poapMemo;
          } catch (error) {
            console.error(`[API::USER_MEMOS] Error processing collection ${collection.id}:`, error);
            return null;
          }
        }),
      );

      for (const memo of poapMemos) {
        if (memo) {
          res.push(memo);
        }
      }
    }
  } catch (err) {
    // Log but continue with backend memos only
    console.error("[API::USER_MEMOS] Failed to fetch POAP memos from indexer:", err);
    if (err && typeof err === "object" && "data" in err) {
      console.error("[API::USER_MEMOS] Error response data:", err.data);
    }
  }

  console.log(`[API::USER_MEMOS] Returning ${res.length} memos for chain ${chain}`);

  return res;
});
