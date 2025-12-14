import { FetchError } from "ofetch";
import type { EmailClaimDetails } from "~/types/email-auth";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Token is required" });
  }

  const [data, err] = await $fetch<EmailClaimDetails>(`${RUNTIME_CONFIG.apiUrl}/auth/email/claim/${token}`, {
    method: "GET",
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (!err) {
    return data;
  }

  if (!(err instanceof FetchError)) {
    console.error("Error fetching claim details:", err);
    throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
  }

  if (err.status === 429) {
    throw createError({ statusCode: 429, statusMessage: "Too many requests. Please try again later." });
  }

  if (err.status === 404) {
    throw createError({ statusCode: 404, statusMessage: "Claim not found or expired" });
  }

  if (err.status === 410) {
    throw createError({ statusCode: 410, statusMessage: "This claim has already been used" });
  }

  console.error("Error fetching claim details:", err);
  throw createError({ statusCode: 500, statusMessage: "An unknown error has occurred" });
});
