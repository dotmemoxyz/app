<template>
  <dot-button variant="tertiary" :size="size" @click="open">
    {{ accountStore.hasSelectedAccount ? `${accountStore.accountName} ${accountStore.shortAddress}` : "Connect" }}
  </dot-button>
</template>

<script lang="ts" setup>
import { useModal } from "vue-final-modal";
import ConnectModal from "~/components/modals/connect-modal.vue";

const accountStore = useAccountStore();

defineProps<{
  size?: "small" | "medium" | "large";
}>();

const { open, close } = useModal({
  component: ConnectModal,
  attrs: {
    onConfirm() {
      close();
    },
  },
});
</script>

<style></style>
