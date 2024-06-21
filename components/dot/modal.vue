<template>
  <dot-button @click="open">Open modal</dot-button>
</template>

<script lang="ts" setup>
import { useModal } from "vue-final-modal";
import TestModal from "../modals/test.vue";

const { open, close } = useModal({
  component: TestModal,
  attrs: {
    title: "Hello World!",
    onConfirm() {
      close();
    },
  },
  slots: {
    default: '<p class="text-text-color">The content of the modal</p>',
  },
});
</script>
