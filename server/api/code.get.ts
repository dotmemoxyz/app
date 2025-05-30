import { $purify as purify, $obtain as obtain } from "@kodadot1/minipfs";
import type { MemoDTO, Memo } from "~/types/memo";

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

  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/poaps/${query.code}`)
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    throw new Error("An unknown error has occoured");
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

  const memo: Memo = {
    id: rawData.id,
    chain: rawData.chain,
    collection: rawData.collection,
    name: rawData.name,
    description: meta.description,
    image,
    mint: rawData.mint,
    createdAt: rawData.created_at,
    expiresAt: rawData.expires_at,
  };

  return memo;
});
