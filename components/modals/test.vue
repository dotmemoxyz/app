<template>
  <VueFinalModal
    class="flex items-center justify-center"
    content-class="flex flex-col p-4 gap-4 bg-background-color border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <h1 class="text-2xl text-text-color">{{ title }}</h1>
    <slot />
    <dot-button variant="primary" @click="emit('confirm')">Confirm</dot-button>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal } from "vue-final-modal";

defineProps<{
  title?: string;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
}>();
</script>
