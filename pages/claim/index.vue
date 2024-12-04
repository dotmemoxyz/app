<template>
  <div class="mx-auto flex max-w-xl flex-col items-center space-y-10 p-4">
    <h1 class="mt-10 text-center text-4xl font-bold md:mt-20">.claim</h1>

    <div class="relative flex h-48 w-full rounded-lg border-2 border-white bg-white/5 p-2 md:h-72">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" class="size-full">
        <line
          v-for="n in 30"
          :key="n"
          :x1="(n - 10) * 5 + 1"
          y1="100"
          :x2="(n - 10) * 5 + 40 + 1"
          y2="0"
          stroke="white"
          stroke-width="0.5"
        />
      </svg>
    </div>

    <div class="flex flex-col space-y-1 self-stretch">
      <dot-label text="Enter MEMO Code" class="flex-1">
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
      </dot-label>
      <dot-button
        :disabled="!isCodeValid || status === 'pending'"
        variant="primary"
        size="large"
        @click="continueClaim"
      >
        {{ status === "pending" ? "Searching ..." : "Continue" }}
      </dot-button>
    </div>

    <a href="#">How this works ?</a>
  </div>
</template>
<script setup lang="ts">
import QRScannerModal from "~/components/dot/qr-scanner-modal.vue";
import { useModal } from "vue-final-modal";
import { parseClaimString } from "~/utils/scanner";

const code = ref("");
const isCodeValid = computed(() => code.value.trim().length > 0);

const {
  data: _data,
  status,
  refresh,
  error,
} = await useFetch("/api/code", {
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
