import { $purify as purify } from "@kodadot1/minipfs";
import { DateTime } from "luxon";
import type { MemoDTO, MemoWithCode } from "~/types/memo";
const RUNTIME_CONFIG = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  const { id, chain } = getRouterParams(event);
  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/poaps/detail/${chain}/${id}`)
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    console.error(err);
    throw new Error("An unknown error has occoured");
  }

  if (!rawData) {
    throw createError({
      statusCode: 404,
      message: "Memo not found",
    });
  }

  const image = purify(rawData?.image).at(0);
  if (!image) {
    throw new Error("Image not found");
  }

  // Unify Dates to SQL
  rawData.created_at = DateTime.fromSQL(rawData.created_at).isValid
    ? rawData.created_at
    : DateTime.fromISO(rawData.created_at).toSQL();
  rawData.expires_at = DateTime.fromSQL(rawData.expires_at).isValid
    ? rawData.expires_at
    : DateTime.fromISO(rawData.expires_at).toSQL();

  const memo: MemoWithCode = {
    id: rawData.collection,
    chain: rawData.chain,
    name: rawData.name,
    description: rawData.description,
    image,
    mint: rawData.mint,
    createdAt: rawData.created_at,
    expiresAt: rawData.expires_at,
    code: rawData.id,
    customize: rawData.customize ?? {},
  };
  return memo;
});
