<template>
  <span
    class="relative inline-flex min-w-[45px] max-w-[45px] items-center rounded-full p-[4px]"
    :class="switchContainerClasses"
    @click="!disabled && (model = !model)"
  >
    <input v-model="model" class="peer sr-only" type="checkbox" />
    <span
      class="peer min-h-[13px] min-w-[13px] rounded-full bg-surface-white transition-transform peer-checked:translate-x-[24px] peer-checked:bg-white"
    />
  </span>
</template>
<script lang="ts" setup>
const model = defineModel({
  type: Boolean,
});

const props = defineProps<{
  disabled?: boolean;
}>();

const switchContainerClasses = computed(() => {
  const baseClasses = props.disabled ? "cursor-not-allowed" : "cursor-pointer";
  const bgClasses = model.value ? "bg-accent-primary" : "bg-border-default";
  return [baseClasses, bgClasses];
});
</script>
