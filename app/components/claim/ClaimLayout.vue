<template>
  <div>
    <h1 v-if="claimed" class="!dark:text-white my-10 w-full text-center text-4xl text-accent-primary">
      {{ t("claim.success") }} 🥳
    </h1>

    <div class="mx-auto flex max-w-xl flex-col items-center gap-[32px] p-4 md:mt-24">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  claimed: boolean;
}>();
</script>
