import { getChainEndpointsByPrefix } from "@/utils/chain";
import { getClient, type ChainClient } from "@/utils/dedot/client";
import type { Prefix } from "@kodadot1/static";

export default function (prefix: Ref<Prefix>) {
  const apiUrls = computed(() => {
    const endpoints = getChainEndpointsByPrefix(prefix.value);
    return endpoints;
  });

  const apiInstance = computed<Promise<ChainClient>>(() => getClient(apiUrls.value));

  const apiInstanceByPrefix = (prefix: string) => {
    const endpoints = getChainEndpointsByPrefix(prefix);
    return getClient(endpoints);
  };

  return {
    apiUrls,
    apiInstance,
    apiInstanceByPrefix,
  };
}
