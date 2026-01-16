import { getChainEndpointByPrefix } from "@/utils/chain";
import { getClient, type ChainClient } from "@/utils/dedot/client";
import type { Prefix } from "@kodadot1/static";

export default function (prefix: Ref<Prefix>) {
  const apiUrl = computed(() => {
    const endpoint: string = getChainEndpointByPrefix(prefix.value) || "";
    return endpoint;
  });

  const apiInstance = computed<Promise<ChainClient>>(() => getClient(apiUrl.value));

  const apiInstanceByPrefix = (prefix: string) => {
    const endpoint: string = getChainEndpointByPrefix(prefix) || "";
    return getClient(endpoint);
  };

  return {
    apiUrl,
    apiInstance,
    apiInstanceByPrefix,
  };
}
