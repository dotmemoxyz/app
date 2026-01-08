<template>
  <div class="group relative inline-flex items-center justify-center" :class="triggerClass">
    <!-- Default slot for trigger -->
    <slot name="trigger">
      <div
        class="flex h-[20px] w-[20px] cursor-default items-center justify-center rounded-full border-2 border-text-secondary"
      >
        <span class="text-[12px] text-text-secondary">?</span>
      </div>
    </slot>

    <!-- Tooltip content -->
    <span
      class="pointer-events-none absolute z-50 rounded-lg border border-border-default bg-surface-card px-3 py-2 text-sm text-text-primary opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white dark:text-gray-800"
      :class="positionClasses"
    >
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

<script lang="ts" setup>
type TooltipPosition = "top" | "bottom" | "left" | "right";

const props = withDefaults(
  defineProps<{
    text: string;
    position?: TooltipPosition;
    width?: string;
    triggerClass?: string;
  }>(),
  {
    position: "bottom",
    width: "w-64",
    triggerClass: "",
  },
);

const positionClasses = computed(() => {
  const baseWidth = props.width;

  switch (props.position) {
    case "top":
      return `bottom-full left-1/2 mb-2 -translate-x-1/2 ${baseWidth}`;
    case "bottom":
      return `top-full left-1/2 mt-2 -translate-x-1/2 ${baseWidth}`;
    case "left":
      return `right-full top-1/2 mr-2 -translate-y-1/2 ${baseWidth}`;
    case "right":
      return `left-full top-1/2 ml-2 -translate-y-1/2 ${baseWidth}`;
    default:
      return `bottom-5 right-0 mt-2 ${baseWidth}`;
  }
});
</script>
