import { $obtain as obtain } from "@kodadot1/minipfs";
import { sanitizeIpfsUrl } from "~/utils/ipfs";
import type { Memo } from "~/types/memo";
import { FetchError } from "ofetch";

type Metadata = {
  name: string;
  image: string;
  banner: string;
  kind: string;
  description: string;
  external_url: string;
  type: string;
};

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const query = getQuery(event);

  const [rawData, err] = await $fetch<Memo>(`${RUNTIME_CONFIG.apiUrl}/memos/${query.code}`)
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    if (err instanceof FetchError && err.response?.status !== 404) {
      console.error("Error fetching memo data:", err);
      throw new Error("An unknown error has occoured");
    }
  }

  if (!rawData || !rawData.id) {
    throw createError({
      statusCode: 404,
      message: "Memo not found",
    });
  }

  const image = sanitizeIpfsUrl(rawData?.image);
  if (!image) {
    throw new Error("Image not found");
  }

  const meta = await obtain<Metadata>(sanitizeIpfsUrl(rawData.mint));
  if (!meta) {
    throw new Error("Metadata not found");
  }

  return {
    ...rawData,
    image,
    description: meta.description,
  } satisfies Memo;
});
