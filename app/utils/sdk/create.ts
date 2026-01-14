export function createArgsForNftPallet(account: string, maxSupply?: number) {
  const config = {
    settings: 0n,
    maxSupply,
    mintSettings: {
      mintType: { type: "Issuer" as const },
      price: undefined,
      startBlock: undefined,
      endBlock: undefined,
      defaultItemSettings: 0n,
    },
  };
  return [account, config] as const;
}
