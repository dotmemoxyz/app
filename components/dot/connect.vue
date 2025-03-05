<template>
  <div class="cursor-pointer rounded-xl border px-[16px] py-[14px]" :size="size" @click="open">
    <div v-if="accountStore.hasSelectedAccount" class="flex items-center gap-[12px]">
      <!-- @vue-ignore -->
      <Identicon
        :value="accountStore.selected!.address"
        theme="polkadot"
        class="rounded-full border border-black"
        size="28"
      />
      <small class="text-[14px]">{{ accountStore.shortAddress }}</small>
    </div>
    <small v-else class="text-[14px]">
      {{ $t("common.connect") }}
    </small>
  </div>
</template>

<script lang="ts" setup>
import { useModal } from "vue-final-modal";
import ConnectModal from "~/components/modals/connect-modal.vue";
import { getSupportedWallets } from "~/utils/wallet";
import Identicon from "@polkadot/vue-identicon";

const accountStore = useAccountStore();

defineProps<{
  size?: "small" | "medium" | "large";
}>();

const { open, close } = useModal({
  component: ConnectModal,
  attrs: {
    onConfirm() {
      close();
    },
  },
});
const logger = createLogger("dot:connector");

onMounted(async () => {
  if (accountStore.hasSelectedAccount) {
    return;
  }
  const accountAddress = localStorage.getItem("account-address");
  const accountWallet = localStorage.getItem("account-wallet");
  if (accountAddress && accountWallet) {
    const wallets = getSupportedWallets();
    const installedWallets = wallets.filter((wallet) => wallet.installed);
    const wallet = installedWallets.find((wallet) => wallet.name === accountWallet);
    if (!wallet) {
      return;
    }
    try {
      const accounts = await wallet.getAccounts();
      if (!accounts) {
        accountStore.setLoaded();
        return;
      }
      const account = accounts.find((acc) => acc.address === accountAddress);
      if (account) {
        accountStore.selectAccount(account);
        accountStore.setLoaded();
      }
    } catch (e) {
      logger.error(e);
    }
  }
});
</script>
