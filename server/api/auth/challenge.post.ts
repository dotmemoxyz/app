import type { Challenge } from "~/types/auth";

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const { address } = await readBody(event);

  const [data, err] = await $fetch<Challenge>(`${RUNTIME_CONFIG.apiUrl}/auth/message`, {
    method: "POST",
    body: {
      address,
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err || !data) {
    console.error(`Error fetching challenge message:`, err);
    throw createError({
      statusCode: 500,
      statusMessage: "An unknown error has occurred",
    });
  }

  return data;
});
