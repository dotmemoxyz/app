<template>
  <span
    class="relative box-content inline-flex h-6 w-12 items-center rounded-full border border-black p-1"
    :class="switchContainerClasses"
    @click="!disabled && (model = !model)"
  >
    <input v-model="model" class="peer sr-only" type="checkbox" />

    <span
      class="peer h-6 w-6 rounded-full border border-black bg-k-grey transition-transform peer-checked:translate-x-full peer-checked:bg-white"
    ></span>
  </span>
</template>
<script lang="ts" setup>
const model = defineModel({
  type: Boolean,
});

const props = defineProps<{
  disabled?: boolean;
}>();

const COLOR_CLASSES = [
  "bg-background-color", // disabled 0 checked 0
  "bg-k-primary", // disabled 0 checked 1
  "bg-k-shade/50", // disabled 1 checked 0
  "bg-k-accent-hover", // disabled 1 checked 1
];

const switchContainerClasses = computed(() => {
  const baseClasses = props.disabled ? "cursor-not-allowed" : "cursor-pointer";

  const colorClassesIdx = (Number(props.disabled) << 1) | Number(model.value);

  return `${baseClasses} ${COLOR_CLASSES[colorClassesIdx]}`;
});
</script>
