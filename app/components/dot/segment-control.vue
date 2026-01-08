<template>
  <dot-tabs v-model="model" :options="options" :disabled="disabled" size="md" />
</template>

<script lang="ts" setup>
import type { TabOption } from "./tabs.vue";

const model = defineModel<string>({ required: true });

defineProps<{
  options: TabOption[];
  disabled?: boolean;
}>();
</script>
