import * as zod from "zod";
import type { FetchError } from "ofetch";

// image?: string;
// heading?: string;
// subheading?: string;
// claimText?: string;
// telegram?: string;
// instagram?: string;
// website?: string;
// darkMode?: boolean;
// accentColor?: string;

const customizationSchema = zod.object({
  image: zod.string().optional(),
  heading: zod.string().optional(),
  subheading: zod.string().optional(),
  claimText: zod.string().optional(),
  telegram: zod.string().url().optional(),
  instagram: zod.string().url().optional(),
  website: zod.string().url().optional(),
  darkMode: zod.boolean().optional(),
  accentColor: zod.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { chain, id } = getRouterParams(event);
  const body = await readValidatedBody(event, customizationSchema.parse);

  const RUNTIME_CONFIG = useRuntimeConfig();
  const [rawData, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/poaps/${chain}/${id}/customizations`, {
    method: "PUT",
    body,
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    console.error((err as FetchError).statusMessage);
    throw new Error("An unknown error has occurred");
  }

  return rawData;
});
