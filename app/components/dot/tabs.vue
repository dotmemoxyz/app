<template>
  <div class="flex w-fit gap-[6px] rounded-[18px] bg-surface-card p-[6px]">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :disabled="disabled"
      :class="[
        baseClasses,
        sizeClasses,
        model === option.value ? 'border-black/15 bg-surface-white dark:border-white/15' : 'border-transparent',
        disabled && 'cursor-not-allowed opacity-50',
      ]"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script lang="ts" setup>
export interface TabOption {
  value: string;
  label: string;
}

type TabSize = "sm" | "md" | "lg";

const model = defineModel<string>({ required: true });

const props = withDefaults(
  defineProps<{
    options: TabOption[];
    disabled?: boolean;
    size?: TabSize;
  }>(),
  {
    size: "md",
  },
);

const baseClasses = "cursor-pointer items-center justify-center rounded-xl border transition-all text-text-primary";

const sizeClasses = computed(() => {
  const sizes: Record<TabSize, string> = {
    sm: "px-3 py-1.5 text-xs font-normal",
    md: "px-4 py-2 text-sm font-normal",
    lg: "px-[16px] py-[14px] text-[14px] font-normal leading-[18px]",
  };
  return sizes[props.size];
});
</script>
