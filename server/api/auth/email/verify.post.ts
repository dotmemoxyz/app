import { FetchError } from "ofetch";
import type { VerifyEmailResponse } from "~/types/email-auth";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { token } = await readBody(event);

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token is required",
    });
  }

  const [data, err] = await $fetch<VerifyEmailResponse>(`${RUNTIME_CONFIG.apiUrl}/auth/email/verify`, {
    method: "POST",
    body: {
      token,
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (!err) {
    return data;
  }

  if (!(err instanceof FetchError)) {
    console.error("Error verifying email:", err);
    throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
  }

  if (err.status === 429) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests. Please try again later." });
  }

  if (err.status === 400 || err.status === 404) {
    throw createError({ statusCode: 400, statusMessage: err.data?.message || "Invalid or expired verification token" });
  }

  console.error("Error verifying email:", err);
  throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
});
