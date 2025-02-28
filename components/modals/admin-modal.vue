<template>
  <vue-final-modal
    modal-id="admin-modal"
    class="flex items-center justify-center overflow-hidden"
    content-class="flex w-[calc(100vw-20px)] sm:w-2/3 overflow-hidden md:w-1/2 xl:w-1/3 flex-col max-h-[calc(100vh-40px)] p-6 gap-4 bg-surface-white rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="flex items-center justify-between pb-1">
      <h1 class="text-text-color text-xl font-semibold">{{ t("admin.dialog.confirm") }}</h1>
      <button @click="closeModal()">
        <Icon name="mdi:close" size="32" class="text-text-color" />
      </button>
    </div>

    <hr class="-mx-6" />

    <template v-if="accountStore.hasSelectedAccount">
      <p class="text-text-color mt-2 opacity-70">{{ t("create.dialog.connectedAs") }}</p>

      <div class="flex items-center gap-3">
        <!-- @vue-ignore -->
        <Identicon :size="28" theme="polkadot" :value="currentAccount?.address" />
        <p class="text-text-color">{{ currentAccount?.name }}</p>
      </div>
    </template>

    <hr class="my-3" />

    <span class="relative">
      <!-- <dot-checkbox v-model="codeWroteDown" black /> -->
      <small class="text-lg text-black">{{ $t("admin.dialog.text") }}</small>
    </span>

    <dot-button :disabled="false" variant="primary" size="large" @click="proceed">
      {{ t("create.dialog.proceed") }}
    </dot-button>
  </vue-final-modal>
</template>

<script setup lang="ts">
import Identicon from "@polkadot/vue-identicon";
import { useVfm, VueFinalModal } from "vue-final-modal";
import { SiwsMessage } from "@talismn/siws";

const { t } = useI18n();
const logger = createLogger("AdminModal");

const accountStore = useAccountStore();
const currentAccount = computed(() => accountStore.selected);
const url = useRequestURL();

const proceed = async () => {
  logger.info("proceed");
  try {
    if (!currentAccount.value?.address) {
      throw new Error("No account selected");
    }

    const nonce = await $fetch("/api/siws/init");

    const siwsMessage = new SiwsMessage({
      nonce,
      domain: url.hostname,
      uri: url.href,
      statement: "By singing this message I agree to the terms and conditions of DotMemo project",
      // use prefix of chain your dapp is on:
      address: currentAccount.value?.address,
      chainName: "Polkadot",
    });

    const signer = currentAccount.value?.signer;
    const injector = await getAddress(toDefaultAddress(currentAccount.value?.address));

    if (!signer || !injector) {
      throw new Error("No signer or injector found");
    }

    const signed = await siwsMessage.sign(injector);
    const token = await $fetch("/api/siws/verify", {
      method: "POST",
      body: JSON.stringify({ ...signed, address: currentAccount.value?.address }),
    });

    accountStore.setToken(token);
  } catch (error) {
    logger.error(error);
  } finally {
    closeModal();
  }
};

const vfm = useVfm();
const closeModal = () => vfm.close("admin-modal");
</script>
