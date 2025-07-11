import type { ChallengeExchange } from "~/types/auth";

const RUNTIME_CONFIG = useRuntimeConfig();

interface ExchangeTokenRequest {
  challengeId: string;
  signature: string;
}

export default defineEventHandler(async (event) => {
  const { challengeId, signature } = await readBody(event);

  const body: ExchangeTokenRequest = {
    challengeId: challengeId,
    signature: signature,
  };

  const [data, err] = await $fetch<ChallengeExchange>(`${RUNTIME_CONFIG.apiUrl}/auth/exchange`, {
    method: "POST",
    body,
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err || !data) {
    console.error(`Error exchanging challenge signature:`, err);
    throw createError({
      statusCode: 500,
      statusMessage: "An unknown error has occurred",
    });
  }

  return data;
});
