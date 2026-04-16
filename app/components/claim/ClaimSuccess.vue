<template>
  <template v-if="sn">
    <a v-if="!previewMode" :href="url" class="block w-full">
      <dot-button class="w-full" variant="primary" size="large">
        {{ primaryCtaLabel }}
      </dot-button>
    </a>
    <div v-else class="block w-full">
      <dot-button class="w-full" variant="primary" size="large">
        {{ primaryCtaLabel }}
      </dot-button>
    </div>
    <div class="flex w-full flex-col items-center gap-2">
      <small class="dark:text-white">{{ shareHeading }}</small>
      <span class="mb-10 flex gap-2">
        <button
          type="button"
          class="flex items-center gap-2"
          :class="previewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
          :disabled="previewMode"
          :aria-disabled="previewMode"
          :tabindex="previewMode ? -1 : 0"
          @click="handleShareOnTelegram"
        >
          <div class="overflow-hidden rounded-full border border-white">
            <img src="/socials/telegram.webp" alt="Telegram" class="size-10" />
          </div>
        </button>
        <button
          type="button"
          class="flex items-center gap-2"
          :class="previewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
          :disabled="previewMode"
          :aria-disabled="previewMode"
          :tabindex="previewMode ? -1 : 0"
          @click="handleShareOnX"
        >
          <div class="overflow-hidden rounded-full border border-white">
            <img src="/socials/x.webp" alt="X" class="size-10" />
          </div>
        </button>
      </span>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { MemoCustomize } from "~/types/memo";

const SHARE_MESSAGE = "I just claimed a new MEMO on dotmemo.xyz! 🎉";

const { shareOnTelegram, shareOnX } = useSocials();
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    collection: string;
    chain: string;
    sn: string | undefined;
    memoName?: string;
    customization?: MemoCustomize;
    previewMode?: boolean;
  }>(),
  {
    memoName: "",
    customization: undefined,
    previewMode: false,
  },
);

const successCustomization = computed(() => props.customization?.success ?? {});
const primaryCtaLabel = computed(() => {
  return successCustomization.value.primaryCtaLabel || t("claim.seeInGallery", { name: props.memoName || "MEMO" });
});
const shareHeading = computed(() => successCustomization.value.shareHeading || t("claim.wantToShare"));
const url = computed(() => `https://chaotic.art/${props.chain}/gallery/${props.collection}-${props.sn}`);

const handleShareOnTelegram = () => {
  if (props.previewMode) {
    return;
  }

  shareOnTelegram(SHARE_MESSAGE, url.value);
};

const handleShareOnX = () => {
  if (props.previewMode) {
    return;
  }

  shareOnX(SHARE_MESSAGE, url.value);
};
</script>
