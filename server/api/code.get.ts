import { $purify as purify, $obtain as obtain } from "@kodadot1/minipfs";
import type { MemoWithCode, MemoDTO } from "~/types/memo";
import { FetchError } from "ofetch";

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

  const [rawData, err] = await $fetch<MemoDTO>(`${RUNTIME_CONFIG.apiUrl}/memos/${query.code}`)
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (err) {
    console.error("Error fetching memo data:", err);
    if (err instanceof FetchError && err.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: "Memo not found",
      });
    }
    throw new Error("An unknown error has occoured");
  }

  if (!rawData || !rawData.id) {
    throw createError({
      statusCode: 404,
      message: "Memo not found",
    });
  }

  const image = purify(rawData?.image).at(0);
  if (!image) {
    throw new Error("Image not found");
  }

  const meta = await obtain<Metadata>(rawData.mint);
  if (!meta) {
    throw new Error("Metadata not found");
  }

  const memo: MemoWithCode = {
    id: rawData.id,
    code: rawData.code,
    chain: rawData.chain,
    name: rawData.name,
    description: meta.description,
    image,
    mint: rawData.mint,
    createdAt: rawData.createdAt,
    expiresAt: rawData.expiresAt,
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
