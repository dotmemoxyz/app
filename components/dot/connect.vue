<template>
  <dot-button variant="tertiary" :size="size" @click="open">
    {{ accountStore.hasSelectedAccount ? `${accountStore.accountName} ${accountStore.shortAddress}` : "Connect" }}
  </dot-button>
</template>

<script lang="ts" setup>
import { useModal } from "vue-final-modal";
import ConnectModal from "~/components/modals/connect-modal.vue";
import { getSupportedWallets } from "~/utils/wallet";

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
        return;
      }
      const account = accounts.find((acc) => acc.address === accountAddress);
      if (account) {
        accountStore.selectAccount(account);
      }
    } catch (e) {
      logger.error(e);
    }
  }
});
</script>
