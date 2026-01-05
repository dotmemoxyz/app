import * as zod from "zod";
import { FetchError } from "ofetch";

const addOrganizerSchema = zod.object({
  address: zod.string().min(1, "Address is required"),
});

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const { chain, id } = getRouterParams(event);

  const body = await readValidatedBody(event, addOrganizerSchema.parse);

  const token = getCookie(event, "account-token");
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const [data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/organizers/${chain}/${id}`, {
    method: "POST",
    body: {
      address: body.address,
    },
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
      if (err.statusCode === 400) {
        throw createError({
          statusCode: 400,
          message: err.data?.error || "Invalid request",
        });
      }
    }
    console.error(err);
    throw createError({
      statusCode: 500,
      message: `[API::ORGANIZERS] Failed to add organizer: ${err.message || "Unknown error"}`,
    });
  }

  return data;
});
