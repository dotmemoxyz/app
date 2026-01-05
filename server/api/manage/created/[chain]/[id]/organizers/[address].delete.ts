import { FetchError } from "ofetch";

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();

  const { chain, id, address } = getRouterParams(event);

  const token = getCookie(event, "account-token");
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const [data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/organizers/${chain}/${id}/${address}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    if (err instanceof FetchError) {
      if (err.statusCode === 404) {
        throw createError({
          statusCode: 404,
          message: "Organizer not found",
        });
      }
      if (err.statusCode === 401) {
        throw createError({
          statusCode: 401,
          message: "Unauthorized access",
        });
      }
      if (err.statusCode === 403) {
        throw createError({
          statusCode: 403,
          message: "Only the memo creator can manage organizers",
        });
      }
    }
    console.error(err);
    throw createError({
      statusCode: 500,
      message: `[API::ORGANIZERS] Failed to remove organizer: ${err.message || "Unknown error"}`,
    });
  }

  return data;
});
