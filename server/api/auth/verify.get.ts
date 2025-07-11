import { FetchError } from "ofetch";

const RUNTIME_CONFIG = useRuntimeConfig();

interface VerifyTokenResponse {
  address: string;
  expiresAt: string;
}

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event);

  const [data, err] = await $fetch<VerifyTokenResponse>(`${RUNTIME_CONFIG.apiUrl}/auth/verify`, {
    method: "GET",
    headers: {
      Authorization: headers["authorization"] || "",
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err || !data) {
    if (err instanceof FetchError && err.response?.status === 401) {
      return false;
    }
    console.error(`Error verifying token:`, err);
    throw createError({
      statusCode: 500,
      statusMessage: "An unknown error has occurred",
    });
  }

  return true;
});
