<template>
  <span class="flex w-full cursor-pointer items-center gap-2" @click="inputRef?.value && inputRef.click()">
    <!-- Div with color -->
    <span
      class="flex aspect-square h-[50px] items-center justify-center rounded-[12px]"
      :style="{
        backgroundColor: model,
      }"
    />

    <!-- Color picker -->
    <input ref="inputRef" v-model="model" type="color" class="hidden" />
    <!-- Color as text -->
    <p class="flex h-full w-full items-center rounded-[12px] border-2 px-4 text-[14px] font-semibold text-text-primary">
      {{ model ?? placeholder }}
    </p>
  </span>
</template>

<script lang="ts" setup>
const model = defineModel<string>();

defineProps<{
  placeholder?: string;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
</script>
