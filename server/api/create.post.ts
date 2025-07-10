import type { CreateMemoDTO } from "~/types/memo";
import { FetchError } from "ofetch";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  // const { image, name, description, externalUrl, startDate, endDate, quantity, secret, chain, collection } =
  //   await readBody(event);

  const { secret, mint, collection, chain, name, image, expiresAt, createdAt } = await readBody<CreateMemoDTO>(event);

  const [data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/memos`, {
    method: "POST",
    body: {
      secret,
      chain,
      mint,
      collection,
      name,
      image,
      expiresAt,
      createdAt,
    },
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
