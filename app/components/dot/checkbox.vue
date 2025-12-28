<template>
  <div
    class="flex min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-sm border-2 border-black dark:border-white"
    :class="{ '!border-black': black }"
    @click="model = !model"
  >
    <input v-model="model" type="checkbox" class="hidden" />
    <Icon
      v-if="model"
      name="mdi:check"
      class="text-black dark:text-white"
      :class="{ '!text-black': black }"
      size="20"
    />
  </div>
</template>
<script lang="ts" setup>
const model = defineModel<boolean>();

defineProps<{
  black?: boolean;
}>();
</script>
