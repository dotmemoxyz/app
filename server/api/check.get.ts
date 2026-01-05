import { FetchError } from "ofetch";
import type { ClaimMemoResponse } from "~/types/memo";

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const { id } = getQuery(event);

  const [data, err] = await $fetch<ClaimMemoResponse>(`${RUNTIME_CONFIG.apiUrl}/memos/check/${id}`, {
    method: "GET",
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    if (err instanceof FetchError && err.status === 409) {
      throw createError({
        status: 409,
        statusText: "MEMO has already been claimed",
      });
    }
    console.error("Unknown claim error", err);
    throw createError({
      status: 500,
      statusText: "An unknown error has occurred",
    });
  }

  return data!;
});
