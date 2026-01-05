<template>
  <div
    class="flex cursor-pointer items-center justify-between rounded-xl border border-border-default px-[16px] py-[14px] hover:border-text-placeholder"
    :class="{
      'bg-accent-primary': !accountStore.hasSelectedAccount,
      'bg-surface-white': accountStore.hasSelectedAccount,
    }"
    :size="size"
    @click="open"
  >
    <div v-if="accountStore.hasSelectedAccount" class="flex items-center gap-[12px]">
      <!-- @vue-ignore -->
      <Identicon
        :value="accountStore.selected!.address"
        :theme="'polkadot'"
        class="rounded-full border border-black"
        :size="28"
      />
      <small class="text-[14px] text-text-primary">{{
        props.long ? accountStore.midAddress : accountStore.shortAddress
      }}</small>
    </div>
    <small v-else class="text-[14px]">
      {{ $t("common.connect") }}
    </small>
    <small v-if="long && accountStore.hasSelectedAccount" class="text-[14px] text-text-secondary">
      {{ $t("common.change") }}
    </small>
  </div>
</template>

<script lang="ts" setup>
import { useModal } from "vue-final-modal";
import ConnectModal from "~/components/modals/connect-modal.vue";
import { getSupportedWallets } from "~/utils/wallet";
import Identicon from "@polkadot/vue-identicon";

const accountStore = useAccountStore();

const props = defineProps<{
  size?: "small" | "medium" | "large";
  long?: boolean;
}>();

const route = useRoute();

const redirectIfManage = () => {
  if (route.path.startsWith("/manage")) {
    navigateTo("/");
  }
};

const { open, close } = useModal({
  component: ConnectModal,
  attrs: {
    onConnect() {
      close();
      redirectIfManage();
    },
    onDisconnect() {
      close();
      redirectIfManage();
    },
    onClose() {
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
      }
    } catch (e) {
      logger.error(e);
    }
  }

  const token = localStorage.getItem("account-token");
  if (token) {
    const { verifyToken } = useAuth();
    try {
      const res = await verifyToken();
      if (!res) {
        logger.warn("Token verification failed, token is invalid or expired");
        localStorage.removeItem("account-token");
      } else {
        accountStore.setToken(token);
      }
    } catch (e) {
      logger.error("Token verification failed", e);
      localStorage.removeItem("account-token");
    }
  }
  accountStore.setLoaded();
});
</script>
