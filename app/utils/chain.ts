import { ENDPOINT_MAP, type Prefix } from "@kodadot1/static";

export const getChainEndpointByPrefix = (prefix: string) => {
  const endpoint: string | undefined = ENDPOINT_MAP[prefix as Prefix];

  return endpoint;
};
