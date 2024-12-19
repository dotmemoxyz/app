<template>
  <div class="cursor-pointer rounded-md border-2 border-white bg-transparent p-4 text-k-primary" @click="displaySelect">
    <select
      ref="selectInput"
      v-model="model"
      class="h-full w-full cursor-pointer bg-transparent text-white focus:outline-none"
    >
      <option v-for="option in options" :key="option.value" :value="option.value" :selected="option.value === model">
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import type { Option } from "~/types/components";
const model = defineModel<string>({ required: true });
defineProps<{
  options: Option[];
}>();

const selectInput = ref<HTMLSelectElement | null>(null);

const displaySelect = () => {
  if (selectInput.value) {
    selectInput.value.click();
  }
};
</script>

<style></style>
