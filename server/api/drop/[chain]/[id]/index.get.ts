import { $purify as purify } from "@kodadot1/minipfs";
import { DateTime } from "luxon";
import type { MemoDTO, MemoWithCode } from "~/types/memo";
const RUNTIME_CONFIG = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  const { id, chain } = getRouterParams(event);
  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/manage/memos/${chain}/${id}`)
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
  rawData.createdAt = DateTime.fromSQL(rawData.createdAt).isValid
    ? rawData.createdAt
    : DateTime.fromISO(rawData.createdAt).toSQL();
  rawData.expiresAt = DateTime.fromSQL(rawData.expiresAt).isValid
    ? rawData.expiresAt
    : DateTime.fromISO(rawData.expiresAt).toSQL();

  const memo: MemoWithCode = {
    id: rawData.id,
    chain: rawData.chain,
    name: rawData.name,
    description: rawData.description,
    image,
    mint: rawData.mint,
    createdAt: rawData.createdAt,
    expiresAt: rawData.expiresAt,
    code: rawData.code,
    customize: rawData.customize ?? {},
  };
  return memo;
});
