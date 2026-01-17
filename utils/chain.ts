import { ENDPOINT_MAP, type Prefix } from "@kodadot1/static";

const O_ENDPOINT_MAP = {
  ...ENDPOINT_MAP,
  ahp: "wss://asset-hub-polkadot-rpc.n.dwellir.com",
  ahk: "wss://asset-hub-kusama-rpc.n.dwellir.com",
};

export const getChainEndpointByPrefix = (prefix: string) => {
  console.log("getChainEndpointByPrefix called with", O_ENDPOINT_MAP[prefix as Prefix]);
  const endpoint: string | undefined = O_ENDPOINT_MAP[prefix as Prefix];
  console.log("getChainEndpointByPrefix", prefix, endpoint);

  return endpoint;
};
