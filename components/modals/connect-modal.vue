<template>
  <VueFinalModal
    class="flex items-center justify-center px-4 py-6"
    content-class="flex w-full mx-2 max-h-full overflow-y-scroll md:mx-0 md:w-2/5 flex-col p-6 gap-4 bg-background-color rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <template v-if="state === 'wallet'">
      <h1 class="text-2xl font-semibold text-text-color">{{ t("wallets.selectWallet") }}</h1>
      <div class="flex flex-col gap-2">
        <div class="mb-4 flex flex-col gap-3">
          <dot-button
            v-for="wallet in installedWallets"
            :key="wallet.name"
            class="flex w-full"
            variant="tertiary"
            @click="selectWallet(wallet)"
          >
            <div class="flex w-full items-center">
              <div class="overflow-hidden rounded-full border-2 border-white">
                <img :src="wallet.img" class="h-12 w-12" />
              </div>
              <div class="flex flex-1 flex-col items-start gap-1 px-4 py-3">
                <h2 class="font-bold">{{ wallet.name }}</h2>
              </div>
            </div>
          </dot-button>
          <div class="flex flex-col gap-2">
            <button class="flex w-full items-center justify-between" @click="showBreakdown = !showBreakdown">
              <h2 class="text-lg font-semibold text-text-color">{{ t("wallets.other") }}</h2>
              <Icon
                :name="`mdi:chevron-${showBreakdown ? 'up' : 'down'}`"
                size="20"
                class="text-text-color opacity-50"
              />
            </button>
            <template v-if="showBreakdown">
              <dot-button
                v-for="wallet in availableWallets"
                :key="wallet.name"
                class="flex w-full"
                variant="tertiary"
                disabled
                @click="selectWallet(wallet)"
              >
                <div class="flex w-full items-center">
                  <div class="overflow-hidden rounded-full border-2 border-white">
                    <img :src="wallet.img" class="h-12 w-12" />
                  </div>
                  <div class="flex w-full flex-1 flex-col items-start gap-1 px-4 py-3">
                    <h2 class="font-bold">{{ wallet.name }}</h2>
                  </div>
                  <a :href="wallet.guideUrl" class="text-text-color hover:text-white">{{ t("common.download") }}</a>
                </div>
              </dot-button>
            </template>
          </div>

          <dot-button variant="tertiary" @click="disconnect"> {{ t("common.disconnect") }} </dot-button>
          <dot-button variant="tertiary" @click="emit('confirm')"> {{ t("common.cancel") }} </dot-button>
        </div>
      </div>
    </template>
    <template v-if="state === 'account'">
      <h1 class="text-2xl font-semibold text-text-color">{{ t("wallets.selectAccount") }}</h1>
      <div class="flex flex-col gap-2">
        <div class="mb-4 flex flex-col gap-3">
          <dot-button
            v-for="account in accountStore.accounts"
            :key="account.address"
            class="flex w-full"
            :variant="selectedAccount?.address === account.address ? 'primary' : 'tertiary'"
            @click="selectedAccount = account"
          >
            <div class="flex w-full items-center">
              <div class="rounded-full border-2 border-white">
                <!-- @vue-ignore -->
                <Identicon :size="52" theme="polkadot" :value="account.address" />
              </div>

              <div class="flex flex-1 flex-col items-start gap-1 px-4 py-3">
                <h2 class="font-bold">{{ account.name }}</h2>
                <p class="text-xs">
                  {{ addressShortener(account.address, 7, -7) }}
                </p>
              </div>
            </div>
          </dot-button>
        </div>
        <div class="flex justify-end gap-2">
          <dot-button class="w-full" variant="tertiary" @click="state = 'wallet'"> {{ t("common.back") }} </dot-button>
          <dot-button class="w-full" :disabled="!selectedAccount" variant="primary" @click="saveAndClose">
            {{ t("common.confirm") }}
          </dot-button>
        </div>
      </div>
    </template>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from "vue-final-modal";
import { useAccountStore } from "~/stores/account";
import Identicon from "@polkadot/vue-identicon";
import { getSupportedWallets } from "~/utils/wallet";
import type { BaseDotsamaWallet, ExtendedDotsamaAccount } from "~/utils/wallet/base_dotsama_wallet";

const emit = defineEmits<{
  (e: "confirm"): void;
}>();
const { t } = useI18n();

const state = ref<"wallet" | "account">("wallet");
const showBreakdown = ref(false);

const accountStore = useAccountStore();

const installedWallets = ref<BaseDotsamaWallet[]>([]);
const availableWallets = ref<BaseDotsamaWallet[]>([]);

onMounted(async () => {
  const wallets = getSupportedWallets();
  installedWallets.value = wallets.filter((wallet) => wallet.installed);
  availableWallets.value = wallets.filter((wallet) => !wallet.installed);
});

const selectedWallet = ref<BaseDotsamaWallet | null>(null);

const selectWallet = async (wallet: BaseDotsamaWallet) => {
  selectedWallet.value = wallet;
  const accounts = await wallet.getAccounts();
  accountStore.setAccounts(accounts ?? []);
  state.value = "account";
};

const selectedAccount = ref<ExtendedDotsamaAccount | null>(null);

const saveAndClose = () => {
  if (selectedAccount.value && selectedWallet.value) {
    accountStore.selectAccount(selectedAccount.value);
    localStorage.setItem("account-address", selectedAccount.value.address);
    localStorage.setItem("account-wallet", selectedWallet.value.name);

    emit("confirm");
  }
};

const disconnect = () => {
  accountStore.disconnect();
  localStorage.removeItem("account");
  emit("confirm");
};
</script>

<style>
* {
  font-family: "Unbounded", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
</style>
