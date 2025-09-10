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
    },
    initializeToken() {
      // Initialize token from cookie if available
      if (import.meta.client) {
        const accountTokenCookie = useCookie("account-token");
        if (accountTokenCookie.value) {
          this.token = accountTokenCookie.value;
        }
      }
    },
  },

  getters: {
    hasSelectedAccount: (state) => !!state.selected,
    shortAddress: (state) => {
      if (!state.selected) return "";
      return addressShortener(state.selected.address);
    },
    midAddress: (state) => {
      if (!state.selected) return "";
      return addressShortener(state.selected.address, 8);
    },
    accountName: (state) => {
      if (!state.selected) return "";
      return state.selected.name ?? "";
    },
  },
});
