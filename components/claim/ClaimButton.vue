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
        'opacity-100': isClaiming,
        'opacity-0': !isClaiming,
      }"
    >
      <div
        class="flex items-center justify-end rounded-full bg-accent-primary transition-all duration-[60000ms] ease-linear"
        :style="`width: ${isClaiming ? '100%' : '17%'};`"
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
  isClaiming: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>
