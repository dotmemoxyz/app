import { FetchError } from "ofetch";

interface Organizer {
  address: string;
  addedBy: string;
  createdAt: string;
}

interface OrganizersResponse {
  organizers: Organizer[];
}

export default defineEventHandler(async (event) => {
  const { chain, id } = getRouterParams(event);

  const token = getCookie(event, "account-token");
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const RUNTIME_CONFIG = useRuntimeConfig();
  const [data, err] = await $fetch<OrganizersResponse>(`${RUNTIME_CONFIG.apiUrl}/organizers/${chain}/${id}`, {
    method: "GET",
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
          message: "Memo not found",
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
      message: `[API::ORGANIZERS] Failed to fetch organizers: ${err.message || "Unknown error"}`,
    });
  }

  return data;
});
