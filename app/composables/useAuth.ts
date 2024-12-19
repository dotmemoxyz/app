import { useAccountStore } from "@/stores/account";

export default function () {
  const accountStore = useAccountStore();

  const accountId = computed(() => accountStore.selected?.address);
  const name = computed(() => accountStore.selected?.name);
  const isLogIn = computed(() => accountStore.hasSelectedAccount);
  const balance = computed(() => 0); // TODO: balance from where?

  return {
    accountId,
    name,
    isLogIn,
    balance,
  };
}
