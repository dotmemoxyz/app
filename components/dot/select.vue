<template>
  <div class="relative flex h-[45px] items-center">
    <select
      ref="selectInput"
      v-model="model"
      class="h-full w-full cursor-pointer appearance-none rounded-xl border border-border-default bg-transparent px-4 py-3 focus:outline-none"
    >
      <option v-for="option in options" :key="option.value" :value="option.value" :selected="option.value === model">
        {{ option.text }}
      </option>
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Option } from "~/types/components";
const model = defineModel<string>({ required: true });
defineProps<{
  options: Option[];
}>();
</script>
