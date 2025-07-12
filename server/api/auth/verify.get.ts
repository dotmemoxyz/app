import { FetchError } from "ofetch";
import type { VerifyTokenResponse } from "~/types/auth";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "account-token");
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const [data, err] = await $fetch<VerifyTokenResponse>(`${RUNTIME_CONFIG.apiUrl}/auth/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err || !data) {
    if (err instanceof FetchError && err.response?.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    console.error(`Error verifying token:`, err);
    throw createError({
      statusCode: 500,
      statusMessage: "An unknown error has occurred",
    });
  }

  return data;
});
