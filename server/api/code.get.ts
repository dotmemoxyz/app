import { $purify as purify, $obtain as obtain } from "@kodadot1/minipfs";
import type { MemoWithCode, MemoDTO } from "~/types/memo";

const RUNTIME_CONFIG = useRuntimeConfig();

type Metadata = {
  name: string;
  image: string;
  banner: string;
  kind: string;
  description: string;
  external_url: string;
  type: string;
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/poaps/${query.code}`)
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    throw new Error("An unknown error has occoured");
  }

  if (!rawData) {
    throw createError({
      statusCode: 404,
      message: "Memo not found",
    });
  }

  const image = purify(rawData?.image).at(0);
  if (!image) {
    throw new Error("Image not found");
  }

  const meta = await obtain<Metadata>(rawData?.mint);
  if (!meta) {
    throw new Error("Metadata not found");
  }

  const memo: MemoWithCode = {
    code: rawData.id,
    chain: rawData.chain,
    id: rawData.collection,
    name: rawData.name,
    description: meta.description,
    image,
    mint: rawData.mint,
    createdAt: rawData.created_at,
    expiresAt: rawData.expires_at,
    customize: rawData.customize,
    // ?? {
    //   heading: "Test heading",
    //   subheading: "Lorem ipsum dolor sit amet consectetur. In suspendisse justo diam arcu in tellus.",
    //   claimText: "Claim your test MEMO",
    //   telegram: "https://t.me/kodadot",
    //   instagram: "https://instagram.com/kodadot",
    //   website: "https://kodadot.xyz",
    //   accentColor: "#FF9900",
    //   darkMode: true,
    //   image: "https://kodadot.xyz/images/logo.png",
    // },
  };

  return memo;
});
