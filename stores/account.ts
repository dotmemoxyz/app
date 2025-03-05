import { defineStore } from "pinia";
import type { ExtendedDotsamaAccount } from "~/utils/wallet/base_dotsama_wallet";

interface StoreState {
  accounts: ExtendedDotsamaAccount[];
  selected: ExtendedDotsamaAccount | null;
  loaded: boolean;
  token: string | null;
}

export const useAccountStore = defineStore({
  id: "account",
  state: (): StoreState => ({
    accounts: [],
    selected: null,
    loaded: false,
    token: null,
  }),
  actions: {
    setAccounts(accounts: ExtendedDotsamaAccount[]) {
      this.accounts = accounts;
    },
    setLoaded() {
      this.loaded = true;
    },
    selectAccount(account: ExtendedDotsamaAccount) {
      this.selected = account;
    },
    setToken(token: string) {
      this.token = token;
    },
    disconnect() {
      this.selected = null;
      this.token = null;
    },
  },

  getters: {
    hasSelectedAccount: (state) => !!state.selected,
    hasToken: (state) => !!state.token,
    shortAddress: (state) => {
      if (!state.selected) return "";
      return addressShortener(state.selected.address);
    },
    accountName: (state) => {
      if (!state.selected) return "";
      return state.selected.name ?? "";
    },
  },
});
