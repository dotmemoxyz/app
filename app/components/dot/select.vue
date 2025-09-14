<template>
  <ClientOnly>
    <VueSelect
      v-model="model"
      :classes="{
        control: 'border h-[45px] !rounded-[12px] border-border-default gap-x-[12px] px-[19px]',
      }"
      :is-clearable="false"
      :options="localOptions"
    />
  </ClientOnly>
</template>

<script lang="ts" setup>
import VueSelect from "vue3-select-component";
import type { Option } from "~/types/components";
const model = defineModel<string>({ required: true });
const props = defineProps<{
  options: Option[];
}>();

const localOptions = computed(() => {
  return props.options.map((option) => ({
    value: String(option.value),
    label: option.text,
  }));
});
</script>
