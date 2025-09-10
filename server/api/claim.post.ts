import { FetchError } from "ofetch";
import type { MemoDTO } from "~/types/memo";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { code, address } = await readBody(event);

  const [data, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/memos/${code}/claim`, {
    method: "POST",
    body: {
      address,
    },
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

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

  return data;
});
