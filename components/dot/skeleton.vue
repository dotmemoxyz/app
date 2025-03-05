<template>
  <div class="animate-pulse" :style="skeletonStyle" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  roundness?: "sm" | "md" | "lg";
  height?: number;
  width?: number;
  color?: string;
}>();

const skeletonStyle = computed(() => {
  return {
    borderRadius: props.roundness === "sm" ? "4px" : props.roundness === "md" ? "8px" : "12px",
    height: props.height ? `${props.height}px` : "100%",
    width: props.width ? `${props.width}px` : "100%",
    backgroundColor: props.color ?? "rgb(var(--surface-card))",
  };
});
</script>
