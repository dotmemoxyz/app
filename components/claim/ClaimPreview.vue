<template>
  <div class="flex flex-col items-center gap-[32px]">
    <image-preview :src="image" />

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
  </div>
</template>

<script setup lang="ts">
interface Customization {
  heading?: string;
  subheading?: string;
  claimText?: string;
  telegram?: string;
  instagram?: string;
  website?: string;
}

defineProps<{
  image?: string;
  name?: string;
  description?: string;
  customization?: Customization;
}>();
</script>
