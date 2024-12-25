<template>
  <div class="flex h-screen w-full flex-col items-center gap-4 p-4">
    <h4 class="text-primary text-2xl">Welcome to .MEMO test component</h4>
    <p>App url: {{ $config.public.appUrl }}</p>
    <h4 class="text-primary text-2xl">API Test:</h4>
    <h2 v-if="pending">Loading...</h2>
    <h2 v-else>Status: {{ data }}</h2>
    <icon name="mdi:reload" class="cursor-pointer" size="24" @click="refresh" />
  </div>
</template>

<script lang="ts" setup>
import { createLogger } from "~~/utils/create-logger";

const logger = createLogger("index");
logger.info("Hello here");

const { data, pending, refresh } = useFetch("/api/health");
</script>
