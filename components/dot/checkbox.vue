<template>
  <div
    class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border-2 border-white"
    @click="model = !model"
  >
    <input v-model="model" type="checkbox" class="hidden" />
    <Icon v-if="model" name="mdi:check" class="text-white" />
  </div>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>();
</script>

<style></style>
