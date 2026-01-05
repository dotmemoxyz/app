<template>
  <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-[14px] text-text-secondary">{{ $t("manage.analytics.timeRange") }}</span>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="range in TIME_RANGES"
          :key="range.key"
          class="rounded-lg px-3 py-2 text-[14px] transition-colors"
          :class="{
            'bg-surface-white text-text-primary': modelValue === range.key,
            'bg-transparent text-text-secondary hover:bg-surface-card': modelValue !== range.key,
          }"
          @click="$emit('update:modelValue', range.key)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>
    <div class="flex items-center gap-2 text-[14px] text-accent-primary-dark">
      <Icon name="mdi:refresh" class="size-[16px]" />
      <span class="hidden sm:inline">{{ $t("manage.analytics.live") }} (≤5min)</span>
      <span class="sm:hidden">Live</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TimeRange } from "~/types/analytics";

defineProps<{
  modelValue: TimeRange;
}>();

defineEmits<{
  "update:modelValue": [value: TimeRange];
}>();

const { t } = useI18n();

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: t("manage.analytics.days7") },
  { key: "30d", label: t("manage.analytics.days30") },
  { key: "90d", label: t("manage.analytics.days90") },
  { key: "all", label: t("manage.analytics.allTime") },
];
</script>
