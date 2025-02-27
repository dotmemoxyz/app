<template>
  <button
    class="dot-button"
    :disabled="disabled"
    :class="btnClasses"
    :type="submit ? 'submit' : 'button'"
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
  }>(),
  {
    disabled: false,
    variant: "primary",
    size: "medium",
  },
);

const SIZE_CLASSES: Record<BtnSize, string> = {
  small: "px-3 py-1 text-sm ",
  medium: "px-4 py-2",
  large: "px-6 py-3 text-lg ",
};

const VARIANT_CLASSES: Record<BtnVariant, string> = {
  primary: `
      bg-accent-primary hover:bg-accent-primary-hover border-2 border-transparent text-primary
      disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
    `,
  secondary: `
      bg-transparent text-accent-primary border-2 border-accent-primary hover:bg-accent-primary hover:text-black/90
      disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
    `,
  tertiary: `
    bg-transparent text-text-primary border-2 border-border-default hover:bg-[rgba(0,0,0,0.1)] hover:text-text-color-inverse
    disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
  `,
  "tertiary-light": `
    bg-transparent text-white border-2 border-white hover:bg-white hover:text-black
    disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
  `,
  "tertiary-dark": `
    bg-transparent text-black border-2 border-black hover:bg-black hover:text-white
    disabled:bg-disabled disabled:text-neutral-7 disabled:opacity-50
  `,
};

const btnClasses = computed(() => {
  const baseClasses = props.disabled ? "cursor-not-allowed" : "cursor-pointer";

  const size = SIZE_CLASSES[props.size];

  const variant = VARIANT_CLASSES[props.variant];

  const radius = props.rounded ? "rounded-full" : "rounded-xl";

  return [baseClasses, size, variant, radius];
});
</script>

<style scoped>
.dot-button {
  @apply inline-flex items-center justify-center gap-1 transition ease-in-out;
}
.dot-button .icon {
  @apply ml-2;
}
</style>
