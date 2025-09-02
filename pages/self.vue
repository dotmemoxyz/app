<template>
  <ClientOnly>
    <SelfQRcode
      v-if="app"
      :self-app="app"
      :on-error="
        () => {
          console.log('Daco sa dojebalo');
        }
      "
      :on-success="
        () => {
          console.log('Co ti jebe');
        }
      "
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { SelfQRcode } from "self-workspace-root/sdk/qrcode-vue";

const { selfApp: app } = useSelf();
</script>
