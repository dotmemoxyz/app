<template>
  <div class="flex" :class="vertical ? 'flex-row items-center justify-between' : 'flex-col gap-2'">
    <label class="font-bold" :class="{ '!text-red': error }"> {{ text }} <span v-if="required">*</span> </label>
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  text: string;
  required?: boolean;
  vertical?: boolean;
  error?: boolean;
}>();
</script>

<style></style>
