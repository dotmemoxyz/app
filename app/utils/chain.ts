import { ENDPOINT_MAP, type Prefix } from "@kodadot1/static";

export const getChainEndpointByPrefix = (prefix: string) => {
  return ENDPOINT_MAP[prefix as Prefix];
};
