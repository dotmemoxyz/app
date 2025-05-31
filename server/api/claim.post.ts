import type { MemoDTO } from "~/types/memo";
import { FetchError } from "ofetch";

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
    if (err instanceof FetchError && err.statusCode === 409) {
      throw createError({
        statusCode: 409,
        message: "You have already claimed this memo",
      });
    }
    console.error(err);
    throw new Error("An unknown error has occoured");
  }

  return data;
});
