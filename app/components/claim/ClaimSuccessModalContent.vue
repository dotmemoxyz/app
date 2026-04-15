<template>
  <div class="flex w-full flex-col items-center gap-6">
    <image-preview :src="successImage" />

    <div class="flex flex-col items-center gap-3 text-center">
      <h2 class="text-2xl font-medium text-text-primary">
        {{ successTitle }}
      </h2>
      <p v-if="successDescription" class="max-w-md text-sm text-text-secondary">
        {{ successDescription }}
      </p>
    </div>

    <ClaimSuccess
      :sn="sn"
      :collection="collection"
      :chain="chain"
      :memo-name="memoName"
      :customization="customization"
      :preview-mode="previewMode"
    />
  </div>
</template>

<script setup lang="ts">
import type { MemoCustomize } from "~/types/memo";

const props = withDefaults(
  defineProps<{
    collection: string;
    chain: string;
    sn?: string;
    memoName?: string;
    memoImage?: string;
    customization?: MemoCustomize;
    previewMode?: boolean;
  }>(),
  {
    memoName: "",
    memoImage: "",
    sn: undefined,
    customization: undefined,
    previewMode: false,
  },
);

const { t } = useI18n();

const successCustomization = computed(() => props.customization?.success ?? {});

const successImage = computed(() => {
  return successCustomization.value.image || props.customization?.image || props.memoImage;
});

const successTitle = computed(() => successCustomization.value.title || t("claim.success"));
const successDescription = computed(() => successCustomization.value.description || "");
</script>
