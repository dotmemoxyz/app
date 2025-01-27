import type { CreateMemoDTO } from "~/types/memo";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  // const { image, name, description, externalUrl, startDate, endDate, quantity, secret, chain, collection } =
  //   await readBody(event);

  const { secret, mint, collection, chain, name, image, expiresAt, createdAt } = await readBody<CreateMemoDTO>(event);

  const [data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/poaps`, {
    method: "POST",
    body: {
      id: secret,
      chain,
      collection: String(collection),
      table_ref: `poaps_${secret.toLowerCase()}`,
      mint,
      name,
      image,
      expires_at: expiresAt,
      created_at: createdAt,
    },
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    console.error(err);
    throw new Error(`[API::CREATE] Failed to create MEMO ${err.message}`);
  }

  return data;
});
