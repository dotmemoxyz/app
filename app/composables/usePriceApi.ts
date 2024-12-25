type PriceDTO = {
  [key: string]: { usd: number };
};

export const usePriceApi = () => {
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

  return { getPrice, getSymbolName };
};
