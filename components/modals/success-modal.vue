<template>
  <vue-final-modal
    modal-id="success-modal"
    class="flex items-center justify-center"
    content-class="flex w-[calc(100vw-20px)] sm:w-2/3 md:w-1/2 xl:w-1/4 flex-col max-h-[calc(100vh-40px)] overflow-y-scroll overflow-x-hidden p-6 gap-4 bg-background-color rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <h1 class="text-2xl font-medium text-text-color">Hooray 🎉</h1>
    <p class="text-text-color">Your MEMO was successfuly created!</p>
    <dot-button variant="primary" size="small" @click="closeModal()">Close</dot-button>
  </vue-final-modal>
</template>

<script setup lang="ts">
import { useVfm, VueFinalModal } from "vue-final-modal";

const vfm = useVfm();
const closeModal = () => vfm.close("success-modal");
</script>
