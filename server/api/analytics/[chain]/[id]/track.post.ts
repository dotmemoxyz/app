import { FetchError } from "ofetch";
import type { TrackEventRequest, TrackEventResponse } from "~/types/analytics";

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();

  const { chain, id } = getRouterParams(event);
  const body = await readBody<TrackEventRequest>(event);

  const [data, err] = await $fetch<TrackEventResponse>(`${RUNTIME_CONFIG.apiUrl}/analytics/${chain}/${id}/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-IPCountry": getHeader(event, "CF-IPCountry") || "",
      "User-Agent": getHeader(event, "User-Agent") || "",
      Referer: getHeader(event, "Referer") || "",
    },
    body,
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    if (err instanceof FetchError) {
      throw createError({
        statusCode: err.statusCode || 500,
        message: err.data?.message || err.message,
      });
    }
    throw createError({
      statusCode: 500,
      message: `Failed to track event: ${err.message || "Unknown error"}`,
    });
  }

  return data;
});
