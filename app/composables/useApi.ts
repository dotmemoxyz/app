import { ApiFactory } from "@kodadot1/sub-api";
import type { ApiPromise } from "@polkadot/api";
import { getChainEndpointByPrefix } from "@/utils/chain";
import type { Prefix } from "@kodadot1/static";

export default function (prefix: Ref<Prefix>) {
  // const config = useRuntimeConfig()

  const apiUrl = computed(() => {
    const endpoint: string = getChainEndpointByPrefix(prefix.value) || "";
    return endpoint;
  });

  const apiInstance = computed<Promise<ApiPromise>>(() => ApiFactory.useApiInstance(apiUrl.value));

  const apiInstanceByPrefix = (_prefix: string) => {
    const endpoint: string = getChainEndpointByPrefix(_prefix) || "";
    return ApiFactory.useApiInstance(endpoint);
  };

  return {
    apiUrl,
    apiInstance,
    apiInstanceByPrefix,
  };
}
