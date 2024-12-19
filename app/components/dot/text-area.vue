<template>
  <div class="flex flex-1 flex-col">
    <span
      class="relative flex w-full items-center justify-between gap-2 rounded-lg border-2 focus-within:border-k-primary"
      :class="wrapperClasses"
    >
      <textarea
        ref="textarea"
        v-model="model"
        :placeholder="placeholder"
        :class="inputClasses"
        :maxlength="limit"
        class="min-h-20 min-w-0 flex-1 resize-y bg-transparent p-3 text-text-color focus:outline-none focus:ring-0"
      />
      <span v-if="Number.isInteger(limit)" class="absolute -top-5 right-0 text-xs text-text-color">
        {{ model?.length ?? 0 }} / {{ limit }}
      </span>
    </span>
    <span class="mt-0.5 text-xs font-semibold text-red-500">
      {{ error ?? "&nbsp;" }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useTextareaAutosize } from "@vueuse/core";

const { textarea } = useTextareaAutosize();

const model = defineModel<string>();

const props = defineProps<{
  placeholder?: string;
  error?: string;
  limit?: number;
}>();

const wrapperClasses = computed(() => {
  if (props.error) {
    return "border-k-red";
  }
  return "border-border-color";
});

const inputClasses = computed(() => {
  if (props.error) {
    return "placeholder:text-k-red";
  }
  return "placeholder:text-text-color/60";
});
</script>
