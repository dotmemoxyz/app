import { defineStore } from "pinia";

export interface State {
  chainProperties: {
    ss58Format: number;
    tokenDecimals: number;
    genesisHash: string;
    tokenSymbol: string;
  };
}

export const useChainStore = defineStore("chain", {
  state: (): State => ({
    chainProperties: {
      ss58Format: 0,
      tokenDecimals: 12,
      genesisHash: "",
      tokenSymbol: "Unit",
    },
  }),
  getters: {
    getChainProperties: (state) => state.chainProperties,
    getChainProperties58Format: (state) => state.chainProperties.ss58Format,
    getChainPropertiesTokenDecimals: (state) => state.chainProperties.tokenDecimals,
  },
  actions: {
    setChainProperties(payload: State["chainProperties"]) {
      this.chainProperties = Object.assign({}, payload);
    },
  },
});
