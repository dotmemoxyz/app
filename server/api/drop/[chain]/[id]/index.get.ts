import { $obtain as obtain, $purify as purify } from "@kodadot1/minipfs";
import type { MemoDTO, MemoWithCode } from "~/types/memo";
import { FetchError } from "ofetch";
import type { Metadata } from "~/services/nftStorage";

const RUNTIME_CONFIG = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  const { id, chain } = getRouterParams(event);
  const token = getCookie(event, "account-token");
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/manage/memos/${chain}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    if (err instanceof FetchError) {
      if (err.statusCode === 404) {
        throw createError({
          statusCode: 404,
          message: "Memo not found",
        });
      }
      if (err.statusCode === 401) {
        throw createError({
          statusCode: 401,
          message: "Unauthorized access",
        });
      }
      if (err.statusCode === 403) {
        throw createError({
          statusCode: 403,
          message: "Not allowed to access this memo",
        });
      }
    }
    console.error(err);
    throw createError({
      statusCode: 500,
      message: `[API::DROP] Failed to fetch memo details: ${err.message || "Unknown error"}`,
    });
  }

  if (!rawData) {
    throw createError({
      statusCode: 404,
      message: "Memo not found",
    });
  }

  const image = purify(rawData?.image).at(0);
  if (!image) {
    throw createError({
      statusCode: 404,
      message: "Image not found",
    });
  }

  const meta = await obtain<Metadata>(rawData.mint);
  if (!meta) {
    throw createError({
      statusCode: 404,
      message: "Metadata not found",
    });
  }

  return {
    ...rawData,
    image,
    description: meta.description,
  } satisfies MemoWithCode;
});
