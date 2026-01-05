<template>
  <div class="relative flex w-full flex-col gap-2">
    <dot-button
      :disabled="disabled"
      variant="primary"
      :force-color="forceColor"
      size="medium"
      class="w-full"
      @click="$emit('click')"
    >
      {{ label }}
    </dot-button>

    <div
      class="pointer-events-none absolute inset-0 top-0 flex rounded-full p-1 transition-all duration-700"
      :class="{
        'opacity-100': showProgress,
        'opacity-0': !showProgress,
      }"
    >
      <div
        class="flex items-center justify-end rounded-full transition-all duration-[60000ms] ease-linear"
        :style="`width: ${showProgress ? '100%' : '17%'}; background-color: ${forceColor || 'var(--color-accent-primary)'};`"
      >
        <Icon name="mdi:chevron-right" class="animate-pulse text-white animate-duration-[1200ms]" size="28" />
        <Icon
          name="mdi:chevron-right"
          class="animate-pulse text-white animate-delay-[400ms] animate-duration-[1200ms]"
          size="28"
        />
        <Icon
          name="mdi:chevron-right"
          class="animate-pulse text-white animate-delay-[800ms] animate-duration-[1200ms]"
          size="28"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  disabled: boolean;
  forceColor?: string;
  label: string;
  showProgress: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>
