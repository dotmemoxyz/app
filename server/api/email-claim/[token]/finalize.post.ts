import { FetchError } from "ofetch";
import type { FinalizeClaimResponse } from "~/types/email-auth";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  const { address } = await readBody(event);

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Token is required" });
  }

  if (!address) {
    throw createError({ statusCode: 400, statusMessage: "Address is required" });
  }

  const [data, err] = await $fetch<FinalizeClaimResponse>(
    `${RUNTIME_CONFIG.apiUrl}/auth/email/claim/${token}/finalize`,
    {
      method: "POST",
      body: { address },
    },
  )
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (!err) {
    return data;
  }

  if (!(err instanceof FetchError)) {
    console.error("Error finalizing claim:", err);
    throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
  }

  if (err.status === 400) {
    throw createError({ statusCode: 400, statusMessage: err.data.message });
  }

  if (err.status === 429) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests. Please try again later." });
  }

  if (err.status === 404) {
    throw createError({ statusCode: 404, statusMessage: "Claim not found or expired" });
  }

  if (err.status === 409) {
    throw createError({ statusCode: 409, statusMessage: "This MEMO has already been claimed" });
  }

  if (err.status === 410) {
    throw createError({ statusCode: 410, statusMessage: "This claim has already been used" });
  }

  console.error("Error finalizing claim:", err);
  throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
});
