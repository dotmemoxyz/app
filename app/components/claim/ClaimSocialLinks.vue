<template>
  <div v-if="hasSocials" class="flex w-full flex-wrap items-center justify-center gap-[12px] rounded-[12px] p-[16px]">
    <a
      v-if="telegram"
      :href="getTelegramUrl(telegram)"
      target="_blank"
      class="flex items-center gap-[6px] px-[14px]"
      rel="noopener noreferrer"
    >
      <icon name="mdi:telegram" size="16" class="text-text-primary" />
      <p>@{{ parseUsername(telegram) }}</p>
    </a>

    <a
      v-if="instagram"
      :href="getInstagramUrl(instagram)"
      target="_blank"
      class="flex items-center gap-[6px] px-[14px]"
      rel="noopener noreferrer"
    >
      <icon name="mdi:instagram" size="16" class="text-text-primary" />
      <p>@{{ parseUsername(instagram) }}</p>
    </a>

    <a
      v-if="twitter"
      :href="getXUrl(twitter)"
      target="_blank"
      class="flex items-center gap-[6px] px-[14px]"
      rel="noopener noreferrer"
    >
      <icon name="simple-icons:x" size="16" class="text-text-primary" />
      <p>@{{ parseUsername(twitter) }}</p>
    </a>

    <a
      v-if="website"
      :href="website"
      target="_blank"
      class="flex items-center gap-[6px] px-[14px]"
      rel="noopener noreferrer"
    >
      <icon name="mdi:web" size="16" class="text-text-primary" />
      <p>{{ formatWeb(website) }}</p>
    </a>
  </div>
</template>

<script setup lang="ts">
import { getTelegramUrl, getInstagramUrl, getXUrl, formatWeb, parseUsername } from "~/utils/web";

const props = defineProps<{
  telegram?: string;
  instagram?: string;
  website?: string;
  twitter?: string;
}>();

const hasSocials = computed(() => props.telegram || props.instagram || props.website || props.twitter);
</script>
