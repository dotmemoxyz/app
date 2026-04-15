<template>
  <VueFinalModal
    class="flex items-center justify-center px-4"
    content-class="relative flex w-full max-w-xl flex-col gap-6 rounded-[28px] border border-border-default bg-surface-white p-6 shadow-2xl"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <button type="button" class="absolute right-4 top-4" @click="closeModal">
      <Icon name="mdi:close" size="24" class="text-text-primary" />
    </button>

    <ClaimSuccessModalContent
      :sn="sn"
      :collection="collection"
      :chain="chain"
      :memo-name="memoName"
      :memo-image="memoImage"
      :customization="customization"
    />
  </VueFinalModal>
</template>

<script setup lang="ts">
import { VueFinalModal, useVfm } from "vue-final-modal";
import type { MemoCustomize } from "~/types/memo";
import ClaimSuccessModalContent from "~/components/claim/ClaimSuccessModalContent.vue";

defineProps<{
  collection: string;
  chain: string;
  sn?: string;
  memoName?: string;
  memoImage?: string;
  customization?: MemoCustomize;
}>();

const vfm = useVfm();

const closeModal = () => vfm.closeAll();
</script>
