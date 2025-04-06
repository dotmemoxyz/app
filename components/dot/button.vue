<template>
  <button
    class="dot-button"
    :disabled="disabled"
    :class="btnClasses"
    :type="submit ? 'submit' : 'button'"
    :style="{
      backgroundColor: forceColor ? forceColor : undefined,
    }"
    @click="$emit('click')"
  >
    <slot class="icon" name="icon" />
    <slot />
  </button>
</template>

<script lang="ts" setup>
import type { BtnSize, BtnVariant } from "./types";

defineEmits<{
  (e: "click"): void;
}>();

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    variant?: BtnVariant;
    size?: BtnSize;
    submit?: boolean;
    rounded?: boolean;
    forceColor?: string;
  }>(),
  {
    disabled: false,
    variant: "primary",
    size: "medium",
    forceColor: undefined,
  },
);

const SIZE_CLASSES: Record<BtnSize, string> = {
  small: "px-3 py-1 text-sm ",
  medium: "px-[16px] py-[14px]",
  large: "px-6 py-3 text-lg ",
};

const VARIANT_CLASSES: Record<BtnVariant, string> = {
  primary: `
      bg-accent-primary hover:bg-accent-primary-hover border-2 border-transparent text-primary
      disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
    `,
  secondary: `
    bg-transparent text-text-primary border border-text-primary hover:bg-[rgba(0,0,0,0.1)] hover:text-text-color-inverse
    disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
  `,
  tertiary: `
    bg-surface-white text-text-primary border border-border-default hover:border-text-placeholder hover:text-text-color-inverse
    disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
  `,
};

const btnClasses = computed(() => {
  const baseClasses = props.disabled ? "cursor-not-allowed" : "cursor-pointer";

  const size = SIZE_CLASSES[props.size];

  const variant = VARIANT_CLASSES[props.variant];

  const radius = props.rounded ? "rounded-full" : "rounded-[12px]";

  return [baseClasses, size, variant, radius];
});
</script>

<style scoped>
.dot-button {
  @apply inline-flex h-fit items-center justify-center gap-[12px] text-nowrap text-[14px] leading-[18px] transition ease-in-out;
}
.dot-button .icon {
  @apply ml-2;
}
</style>
