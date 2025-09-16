import { ALTERNATIVE_ENDPOINT_MAP, type Prefix } from "@kodadot1/static";

export const getChainEndpointByPrefix = (prefix: string) => {
  const endpoint: string | undefined = ALTERNATIVE_ENDPOINT_MAP[prefix as Prefix].at(0);

  return endpoint;
};
