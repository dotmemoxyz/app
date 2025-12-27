import { FetchError } from "ofetch";
import type { InitiateEmailResponse } from "~/types/email-auth";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { email, code } = await readBody(event);

  if (!email || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and code are required",
    });
  }

  const [data, err] = await $fetch<InitiateEmailResponse>(`${RUNTIME_CONFIG.apiUrl}/auth/email/initiate`, {
    method: "POST",
    body: {
      email,
      code,
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (!err) {
    return data;
  }

  if (!(err instanceof FetchError)) {
    console.error("Error initiating email verification:", err);
    throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
  }

  if (err.status === 429) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests. Please try again later." });
  }

  if (err.status === 400) {
    throw createError({ statusCode: 400, statusMessage: err.data?.message || "Invalid email or code" });
  }

  if (err.status === 404) {
    throw createError({ statusCode: 404, statusMessage: "MEMO not found" });
  }

  console.error("Error initiating email verification:", err);
  throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
});
