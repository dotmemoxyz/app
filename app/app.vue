<template>
  <NuxtPwaManifest />
  <nuxt-layout>
    <nuxt-page />
    <ModalsContainer />
  </nuxt-layout>
</template>
<script setup lang="ts">
import { ModalsContainer } from "vue-final-modal";

const route = useRoute();

const logger = createLogger("page:main");
const handleConnectionChange = (online: boolean) => {
  if (online) {
    logger.success("You are now connected to the network.");
    return;
  }
  logger.error("You are now offline.");
  if (route.path !== "/") {
    navigateTo("/");
  }
};

onMounted(() => {
  window.addEventListener("online", () => handleConnectionChange(true));
  window.addEventListener("offline", () => handleConnectionChange(false));
});
</script>
