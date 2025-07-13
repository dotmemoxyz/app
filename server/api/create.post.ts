import { FetchError } from "ofetch";
import * as zod from "zod";

const RUNTIME_CONFIG = useRuntimeConfig();

const createMemoValidator = zod.object({
  secret: zod.string(),
  mint: zod.string(),
  collection: zod.number(),
  chain: zod.string(),
  name: zod.string(),
  image: zod.string(),
  expiresAt: zod.coerce.date(),
  createdAt: zod.coerce.date(),
  creator: zod.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createMemoValidator.parse);

  const [data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/memos`, {
    method: "POST",
    body,
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    if (err instanceof FetchError) {
      console.error(
        `[API::CREATE] Failed to create MEMO: [${err.statusCode}] ${err.statusMessage} - ${JSON.stringify(err.data)}`,
      );
    } else {
      console.error(`[API::CREATE] Failed to create MEMO - unknown error:`, err);
    }
    throw new Error(`[API::CREATE] Failed to create MEMO`);
  }

  return data;
});
