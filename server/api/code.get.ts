import { $purify as purify, $obtain as obtain } from "@kodadot1/minipfs";
import type { MemoWithCode, MemoDTO } from "~/types/memo";

import { FetchError } from "ofetch";
const RUNTIME_CONFIG = useRuntimeConfig();

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
  const query = getQuery(event);

  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/memos/${query.code}`)
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

  const image = purify(rawData?.image).at(0);
  if (!image) {
    throw new Error("Image not found");
  }

  const meta = await obtain<Metadata>(rawData.mint);
  if (!meta) {
    throw new Error("Metadata not found");
  }

  return {
    ...rawData,
    image,
    description: meta.description,
  } satisfies MemoWithCode; // Ensure the return type matches MemoWithCode
});
