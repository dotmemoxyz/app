import { asyncComputed } from "@vueuse/core";
import type { AssetItem } from "~/types/web3";

type PriceDTO = {
  [key: string]: { usd: number };
};

const logger = createLogger("usePriceAPI");

export const usePriceApi = (totalDeposit: Ref<number>, properties: Ref<AssetItem>) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const kodapriceApi = $fetch.create({
    baseURL: RUNTIME_CONFIG.public.api.kodaprice,
  });

  const coingeckoApi = $fetch.create({
    baseURL: RUNTIME_CONFIG.public.api.coingecko,
    credentials: "omit",
  });

  const getSymbolName = <T extends string>(symbol: T) => {
    switch (symbol) {
      case "KSM":
        return "kusama" as const;
      case "DOT":
        return "polkadot" as const;
      case "ETH":
        return "ethereum" as const;
      default:
        return symbol.toLowerCase();
    }
  };

  const getPrice = async (name: string): Promise<PriceDTO> => {
    const emptyPrice = { [name]: { usd: 0 } } as PriceDTO;

    // fetch kodaprice
    const [dataKodaprice, _kodapriceErr] = await kodapriceApi<PriceDTO>(`/price/${name}`)
      .then((res) => [res, null] as const)
      .catch((err) => [null, err] as const);
    if (dataKodaprice) {
      return dataKodaprice;
    }

    // fallback to coingecko
    const [dataCoingecko, _coingeckoErr] = await coingeckoApi<PriceDTO>("/simple/price", {
      params: {
        ids: name,
        vs_currencies: "usd",
      },
    })
      .then((res) => [res, null] as const)
      .catch((err) => [null, err] as const);
    if (dataCoingecko) {
      return dataCoingecko;
    }
    return emptyPrice;
  };
  const symbolValue = computed(() => Math.round(totalDeposit.value * 10000) / 10000);
  const priceError = ref<string | null>(null);
  const priceLoading = ref(false);
  const dollarValue = asyncComputed(
    async () => {
      const name = getSymbolName(properties.value.symbol);
      // We need to make reference before await as dependency tracker does not track asynchronous definitions
      const symbolPrice = symbolValue.value;
      try {
        const prices = await getPrice(name);
        if (prices[name]?.usd === undefined) {
          logger.error("Failed to get symbol price. Data: %O", prices);
          priceError.value = "Failed to fetch currency data. Try again later or contact support.";
          return null;
        }
        return prices[name].usd * symbolPrice;
      } catch (e) {
        priceError.value = "Failed to fetch currency data. Try again later or contact support.";
        logger.error("Failed to fetch currency data. Reason: %s", (e as Error).message);
        return null;
      }
    },
    null,
    priceLoading,
  );

  return { getPrice, getSymbolName, symbolValue, priceError, dollarValue, priceLoading };
};
