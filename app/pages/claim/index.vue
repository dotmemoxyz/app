<template>
  <div class="mx-auto flex max-w-xl flex-col items-center gap-y-[40px] px-4 pt-10">
    <div class="flex flex-col items-center gap-y-[24px]">
      <image-preview />
      <h1 class="text-3xl font-medium">
        {{ $t("claim.enterCode") }}
      </h1>
      <h2 class="text-base font-normal !text-text-secondary">
        {{ $t("claim.enterCodeDescription") }}
      </h2>
    </div>

    <div class="flex flex-col space-y-[16px] self-stretch">
      <form class="flex space-x-4" @submit.prevent="onSubmit()">
        <dot-text-input v-model="code" :error="errorMessage" placeholder="event2024" />
        <div>
          <dot-button variant="tertiary" size="large" @click="open()">
            <template #icon>
              <icon name="mdi:qrcode" size="24" />
            </template>
          </dot-button>
        </div>
      </form>
      <dot-button
        :disabled="!isCodeValid || status === 'pending'"
        variant="primary"
        size="large"
        @click="continueClaim"
      >
        {{ status === "pending" ? t("common.searching") : t("common.continue") }}
      </dot-button>
    </div>

    <a href="https://github.com/dotmemoxyz/app/wiki">{{ t("claim.howThisWorks") }}</a>
  </div>
</template>
<script setup lang="ts">
import QRScannerModal from "~/components/modals/qr-scanner-modal.vue";
import { useModal } from "vue-final-modal";
import { parseClaimString } from "~/utils/scanner";
const { t } = useI18n();
const code = ref("");
const isCodeValid = computed(() => code.value.trim().length > 0);

const { status, refresh, error } = await useFetch("/api/code", {
  query: { code },
  immediate: false,
  watch: false,
});

const router = useRouter();
const continueClaim = async () => {
  await refresh();
  if (status.value === "success") {
    router.push(`/claim/${code.value}`);
  }
};

const onSubmit = () => continueClaim();
const errorMessage = computed(() => (error.value ? "Couldn't load MEMO" : undefined));

const { open } = useModal({
  component: QRScannerModal,
  attrs: {
    onScan(data: string) {
      const parsedData = parseClaimString(data);
      code.value = parsedData;
    },
  },
});
</script>
