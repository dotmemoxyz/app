import * as zod from "zod";
import { FetchError } from "ofetch";

const customizationSchema = zod.object({
  image: zod.string().trim().optional(),
  heading: zod.string().trim().optional(),
  subheading: zod.string().trim().optional(),
  claimText: zod.string().trim().optional(),
  telegram: zod.string().trim().optional(),
  instagram: zod.string().trim().optional(),
  website: zod.string().trim().url().optional(),
  darkMode: zod.boolean().optional(),
  accentColor: zod
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .optional(),
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
  const [rawData, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/manage/memos/${chain}/${id}/customize`, {
    method: "PUT",
    body,
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
    }
    console.error(err);
    throw createError({
      statusCode: 500,
      message: `[API::CUSTOMIZATION] Failed to update memo customization: ${err.message || "Unknown error"}`,
    });
  }

  return rawData;
});
