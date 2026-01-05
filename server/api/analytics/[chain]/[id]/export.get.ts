import { FetchError } from "ofetch";

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

  const [data, err] = await $fetch<string>(`${RUNTIME_CONFIG.apiUrl}/analytics/${chain}/${id}/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    query: { range },
    responseType: "text",
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
      message: `Failed to export analytics: ${err.message || "Unknown error"}`,
    });
  }

  setHeader(event, "Content-Type", "text/csv");
  setHeader(event, "Content-Disposition", `attachment; filename="claims-${id}-${range}.csv"`);

  return data;
});
