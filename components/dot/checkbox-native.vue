<template>
  <label class="flex cursor-pointer items-start gap-[8px]" :class="labelClass">
    <input
      v-model="model"
      type="checkbox"
      class="h-[18px] w-[18px] cursor-pointer"
      :class="checkboxClass"
      :style="{ accentColor: accentColor }"
    />
    <span v-if="$slots.default" class="flex-1 text-[14px] leading-[1.4] text-text-primary">
      <slot />
    </span>
  </label>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>();

defineProps<{
  accentColor?: string;
  checkboxClass?: string;
  labelClass?: string;
}>();
</script>
