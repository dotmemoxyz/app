<template>
  <vue-final-modal
    modal-id="no-funds-modal"
    class="flex items-center justify-center overflow-hidden"
    content-class="flex w-[calc(100vw-20px)] sm:w-2/3 overflow-hidden md:w-1/2 xl:w-1/3 flex-col max-h-[calc(100vh-40px)] p-6 gap-4 bg-background-color rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="flex items-center justify-between pb-1">
      <h1 class="text-xl font-semibold text-text-color">{{ t("create.error.title") }}</h1>
      <button @click="closeModal()">
        <Icon name="mdi:close" size="32" class="text-text-color" />
      </button>
    </div>

    <hr class="-mx-6" />

    <h1 class="text-text-color">{{ t("create.error.issue") }}</h1>
  </vue-final-modal>
</template>

<script setup lang="ts">
import { useVfm, VueFinalModal } from "vue-final-modal";

const { t } = useI18n();

const vfm = useVfm();
const closeModal = () => vfm.close("no-funds-modal");
</script>
