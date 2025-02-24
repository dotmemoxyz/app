import type { Prefix } from "@kodadot1/static";
import type { Memo } from "~/types/memo";

const MEMO_MOCK: Memo = {
  id: "dotdark",
  chain: "ahk",
  collection: "-1",
  description: "This is a test MEMO",
  name: "Test MEMO",
  image: "https://image.w.kodadot.xyz/ipfs/QmUUoVu5M9NosV9utqvgUoxn3euDSASbNREDMmMMHPHXGE",
  mint: "ipfs://QmWqqmYKhXtsfbviJpj9Dhty7qhb91zatDryPcDro2qCeg",
  createdAt: "2024-10-29 16:05:16",
  expiresAt: "2025-01-29 16:05:16",
};

export default defineEventHandler(async (event) => {
  const { chain, id } = getRouterParams(event);
  return {
    ...MEMO_MOCK,
    chain: chain as Prefix,
    collection: id,
  };
});
