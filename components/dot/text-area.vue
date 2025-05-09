<template>
  <div class="flex flex-1 flex-col">
    <span
      class="relative flex w-full items-center justify-between gap-2 rounded-lg border border-border-default focus-within:border-text-secondary"
      :class="wrapperClasses"
    >
      <textarea
        ref="textarea"
        v-model="model"
        :placeholder="placeholder"
        :class="[inputClasses, props.placeholderClass]"
        :maxlength="limit"
        class="min-h-20 min-w-0 flex-1 resize-y bg-transparent p-3 placeholder:text-text-placeholder focus:outline-none focus:ring-0"
      />
      <span v-if="Number.isInteger(limit)" class="absolute -top-7 right-0 text-xs text-text-primary">
        {{ model?.length ?? 0 }} / {{ limit }}
      </span>
    </span>
    <span v-if="error" class="text-red mt-0.5 text-xs font-semibold">
      {{ error ?? "&nbsp;" }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useTextareaAutosize } from "@vueuse/core";
import type { ClassOptions } from "~/types/components";

const { textarea } = useTextareaAutosize();

const model = defineModel<string>();

const props = defineProps<{
  placeholder?: string;
  placeholderClass?: ClassOptions;
  error?: string;
  limit?: number;
}>();

const wrapperClasses = computed(() => {
  if (props.error) {
    return "border-red-500";
  }
  return "border-border-default";
});

const inputClasses = computed(() => {
  if (props.error) {
    return "placeholder:text-red";
  }
  return "placeholder:text-placeholder";
});
</script>
