<template>
  <client-only>
    <VueFinalModal
      modal-id="self-modal"
      class="flex items-center justify-center px-4 py-6"
      content-class="flex w-full max-h-full overflow-hidden  md:mx-0 md:w-2/5 flex-col p-6 gap-5 bg-surface-white rounded-2xl border border-background-color-inverse"
      overlay-transition="vfm-fade"
      content-transition="vfm-fade"
    >
      <div class="flex">
        <h1 class="flex-1 text-4xl text-text-primary">{{ $t("self.verify") }}</h1>

        <a
          target="_blank"
          href="https://self.xyz"
          class="cursor-pointer self-start rounded-full bg-accent-primary px-4 py-2"
        >
          <span>?</span>
        </a>
      </div>

      <p class="text-text-primary">
        {{ $t("self.description") }}
      </p>

      <div class="flex justify-center">
        <SelfQRcode v-if="app" :size="250" :self-app="app" @error="emit('error')" @success="delayedEmitSuccess()">
          <template #MOBILE_CONNECTED>
            <div
              class="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-blue-500 bg-blue-500/10"
            >
              <div class="flex gap-1">
                <div class="size-2 animate-bounce rounded-full bg-blue-500 animate-delay-100"></div>
                <div class="size-2 animate-bounce rounded-full bg-blue-500 animate-delay-200"></div>
                <div class="size-2 animate-bounce rounded-full bg-blue-500 animate-delay-300"></div>
              </div>
            </div>
          </template>

          <template #PROOF_GENERATION_FAILED="{ resetState }">
            <div
              class="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-red-500 bg-red-500/10"
            >
              <h1 class="text-md text-center text-text-primary">{{ $t("self.verificationFail") }}</h1>
              <dot-button variant="tertiary" @click="resetState()">{{ $t("self.tryAgain") }}</dot-button>
            </div>
          </template>

          <template #PROOF_VERIFIED>
            <div
              class="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-accent-primary bg-accent-primary/10"
            >
              <h1 class="text-md text-center text-text-primary">{{ $t("self.verificationSuccess") }}</h1>
            </div>
          </template>
        </SelfQRcode>
      </div>

      <div class="flex justify-center gap-2 text-text-primary">
        <icon name="mdi:arrow-up" size="24" />
        <p>{{ $t("self.verifyInstruction") }}</p>
      </div>

      <dot-button variant="tertiary" @click="closeModal()">{{ $t("common.close") }}</dot-button>
    </VueFinalModal>
  </client-only>
</template>

<script setup lang="ts">
import { useVfm, VueFinalModal } from "vue-final-modal";
import { SelfQRcode } from "@selfxyz/qrcode-vue";

const { selfApp: app } = useSelf();

const emit = defineEmits<{
  (e: "error" | "success"): void;
}>();

const delayedEmitSuccess = () => {
  setTimeout(() => emit("success"), 1000);
};

const vfm = useVfm();
const closeModal = () => vfm.close("self-modal");
</script>
