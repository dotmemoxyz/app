import * as zod from "zod";
import { FetchError } from "ofetch";

const customizationSchema = zod.object({
  startsAt: zod.coerce.date(),
  endsAt: zod.coerce.date(),
});

export default defineEventHandler(async (event) => {
  const { chain, id } = getRouterParams(event);
  const body = await readValidatedBody(event, customizationSchema.parse);

  const token = getCookie(event, "account-token");
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const RUNTIME_CONFIG = useRuntimeConfig();
  const [rawData, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/manage/memos/${chain}/${id}`, {
    method: "PUT",
    body: {
      createdAt: body.startsAt,
      expiresAt: body.endsAt,
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
      console.error(err.statusMessage, JSON.stringify(err.data));
    }
    console.error(err);
    throw createError({
      statusCode: 500,
      message: `[API::MEMO_UPDATE] Failed to update memo: ${err.message || "Unknown error"}`,
    });
  }

  return rawData;
});
