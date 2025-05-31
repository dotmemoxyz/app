<template>
  <VueFinalModal
    modal-id="qr-scanner-modal"
    class="flex items-center justify-center"
    content-class="flex w-full h-full md:h-auto max-w-2xl mx-auto flex-col px-4 py-5 gap-4 bg-surface-white rounded-3xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    @opened="onOpened()"
  >
    <video ref="vid" class="flex-1 rounded-xl object-cover"></video>
    <dot-button size="medium" variant="secondary" @click="closeModal()"> Cancel </dot-button>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { VueFinalModal, useVfm } from "vue-final-modal";
import QRScanner from "qr-scanner";

const vid = ref<HTMLVideoElement | null>(null);
defineExpose({ vid });

const emit = defineEmits<{
  (e: "scan", data: string): void;
}>();

function onOpened() {
  if (vid.value) {
    const qrScanner = new QRScanner(
      vid.value,
      (result) => {
        emit("scan", result.data);
        closeModal();
      },
      {
        returnDetailedScanResult: true,
      },
    );

    qrScanner.start();
  }
}

const vfm = useVfm();
const closeModal = () => vfm.close("qr-scanner-modal");
</script>
