<template>
  <image-preview :src="customization?.image || image" />

  <div class="flex flex-col items-center gap-[24px]">
    <h1 v-if="name" class="text-[31px] font-medium text-text-primary">
      {{ customization?.heading || name }}
    </h1>
    <h2
      v-if="description || customization?.subheading"
      class="text-center text-[16px] font-normal !text-text-secondary"
    >
      {{ customization?.subheading || description }}
    </h2>
  </div>

  <slot />
</template>

<script setup lang="ts">
import type { MemoCustomize } from "~/types/memo";

defineProps<{
  image?: string;
  name?: string;
  description?: string;
  customization?: MemoCustomize;
}>();
</script>
