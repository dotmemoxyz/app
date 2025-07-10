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
    console.error(err);
    throw new Error("An unknown error has occoured");
  }

  return data;
});
