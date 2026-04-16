<template>
  <div class="grid grid-cols-1 gap-x-8 md:grid-cols-3">
    <div class="flex w-full flex-col justify-center gap-8 md:w-auto">
      <slot name="form" />

      <div class="flex w-full flex-col items-center gap-2">
        <dot-button :disabled="disabled" class="w-full" @click="$emit('save')">
          {{ buttonLabel }}
        </dot-button>
        <p v-if="updateError" class="text-center text-sm !text-red-500">{{ updateError }}</p>
        <p v-else-if="submitImageError" class="text-center text-sm !text-yellow-500">
          {{ submitImageError }}
        </p>
        <p v-else-if="!isValid" class="text-center text-sm !text-yellow-500">
          {{ $t("manage.customize.validationRequired") }}
        </p>
      </div>
    </div>

    <div class="col-span-2 flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex w-[450px] justify-between">
          <h2 class="text-xl font-medium">{{ previewTitle }}</h2>
          <p class="text-base font-normal !text-text-secondary">{{ previewHint }}</p>
        </div>
      </div>
      <slot name="preview" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  buttonLabel: string;
  disabled?: boolean;
  isValid?: boolean;
  updateError?: string | null;
  submitImageError?: string | null;
  previewTitle: string;
  previewHint: string;
}>();

defineEmits<{
  save: [];
}>();
</script>
