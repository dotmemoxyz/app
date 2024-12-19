import { defineStore } from "pinia";
import type { ExtendedDotsamaAccount } from "~/utils/wallet/base_dotsama_wallet";

interface StoreState {
  accounts: ExtendedDotsamaAccount[];
  selected: ExtendedDotsamaAccount | null;
}

export const useAccountStore = defineStore({
  id: "account",
  state: (): StoreState => ({
    accounts: [],
    selected: null,
  }),
  actions: {
    setAccounts(accounts: ExtendedDotsamaAccount[]) {
      this.accounts = accounts;
    },
    selectAccount(account: ExtendedDotsamaAccount) {
      this.selected = account;
    },
    disconnect() {
      this.selected = null;
    },
  },

  getters: {
    hasSelectedAccount: (state) => !!state.selected,
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
