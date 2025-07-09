import * as zod from "zod";
import type { FetchError } from "ofetch";

const customizationSchema = zod.object({
  startsAt: zod.coerce.date(),
  endsAt: zod.coerce.date(),
});

export default defineEventHandler(async (event) => {
  const { chain, id } = getRouterParams(event);
  const body = await readValidatedBody(event, customizationSchema.parse);

  const RUNTIME_CONFIG = useRuntimeConfig();
  const [rawData, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/poaps/${chain}/${id}`, {
    method: "PUT",
    body: {
      created_at: body.startsAt,
      expires_at: body.endsAt,
    },
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    console.error((err as FetchError).statusMessage);
    throw new Error("An unknown error has occurred");
  }

  return rawData;
});
