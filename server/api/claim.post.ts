import type { MemoDTO } from "~/types/memo";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { code, address } = await readBody(event);

  const [data, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/poaps/${code}/claim`, {
    method: "POST",
    body: {
      address,
    },
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    console.error(err);
    throw createError({ statusMessage: "An unknown error has occoured" });
  }

  return data;
});
