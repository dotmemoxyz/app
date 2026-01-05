import { FetchError } from "ofetch";
import type { AnalyticsDashboardResponse } from "~/types/analytics";

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();

  const { chain, id } = getRouterParams(event);
  const { range = "7d" } = getQuery(event);
  const token = getCookie(event, "account-token");

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const [data, err] = await $fetch<AnalyticsDashboardResponse>(
    `${RUNTIME_CONFIG.apiUrl}/analytics/${chain}/${id}/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      query: { range },
    },
  )
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
      message: `Failed to fetch analytics dashboard: ${err.message || "Unknown error"}`,
    });
  }

  return data;
});
