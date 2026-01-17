import { ALTERNATIVE_ENDPOINT_MAP, ENDPOINT_MAP, type Prefix } from "@kodadot1/static";

export const getChainEndpointByPrefix = (prefix: string) => {
  return ENDPOINT_MAP[prefix as Prefix];
};

export const getChainEndpointsByPrefix = (prefix: string): string[] => {
  return ALTERNATIVE_ENDPOINT_MAP[prefix as Prefix] || [];
};
