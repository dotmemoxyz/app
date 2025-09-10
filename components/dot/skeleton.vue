<template>
  <div class="animate-pulse" :style="skeletonStyle" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  roundness?: "sm" | "md" | "lg";
  color?: string;
}>();

const skeletonStyle = computed(() => {
  return {
    borderRadius: props.roundness === "sm" ? "4px" : props.roundness === "md" ? "8px" : "36px",
    backgroundColor: props.color ?? "rgb(var(--surface-card))",
  };
});
</script>
