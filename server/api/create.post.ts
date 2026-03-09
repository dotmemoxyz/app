import { FetchError } from "ofetch";
import * as zod from "zod";
import { SECURITY_MODES, MAX_DYNAMIC_MEMO_SUPPLY } from "~/types/memo";

const createMemoValidator = zod
  .object({
    secret: zod.string().optional(),
    securityMode: zod.enum(SECURITY_MODES),
    maxSupply: zod.number().int().positive(),
    mint: zod.string(),
    collection: zod.number(),
    chain: zod.string(),
    name: zod.string(),
    image: zod.string(),
    expiresAt: zod.coerce.date(),
    createdAt: zod.coerce.date(),
    creator: zod.string(),
  })
  .superRefine((data, ctx) => {
    if (data.securityMode === "dynamic" && data.maxSupply > MAX_DYNAMIC_MEMO_SUPPLY) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: `maxSupply cannot exceed ${MAX_DYNAMIC_MEMO_SUPPLY} for dynamic security mode`,
        path: ["maxSupply"],
      });
    }

    if (data.securityMode === "static" && !data.secret) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "secret is required for static securityMode",
        path: ["secret"],
      });
    }
  });

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
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
