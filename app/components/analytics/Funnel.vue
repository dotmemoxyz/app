<template>
  <div class="flex flex-col gap-1">
    <div
      v-if="!steps.length || !hasData"
      class="flex h-[180px] flex-col items-center justify-center gap-3 text-text-secondary"
    >
      <Icon name="mdi:filter-variant" class="size-12 opacity-40" />
      <div class="text-center">
        <p class="text-[14px] font-medium">{{ $t("manage.analytics.noFunnelData") }}</p>
        <p class="mt-1 text-[12px] opacity-70">Funnel data will appear once visitors start interacting</p>
      </div>
    </div>

    <template v-else>
      <template v-for="(step, index) in steps" :key="step.label">
        <div class="flex items-center gap-4">
          <div class="w-20 text-[13px] text-text-secondary sm:w-24 sm:text-[14px]">{{ step.label }}</div>
          <div class="flex-1">
            <div class="bg-surface-default h-8 rounded-lg">
              <div
                class="flex h-full items-center rounded-lg bg-accent-primary-dark px-3 text-[12px] text-white"
                :class="step.value === 0 ? 'justify-center' : 'justify-end'"
                :style="{ width: `${Math.max(getBarWidth(step.value), 8)}%` }"
              >
                {{ step.value.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="index < steps.length - 1" class="ml-20 flex items-center gap-2 pl-2 sm:ml-24 sm:pl-4">
          <Icon name="mdi:arrow-down" class="size-[12px] text-text-secondary" />
          <span class="text-[11px] text-text-secondary"> {{ getConversionRate(index) }}% converted </span>
        </div>
      </template>
      <div class="mt-2 text-[14px] font-medium text-accent-primary-dark">
        {{ $t("manage.analytics.conversion") }}: {{ conversionRate }}%
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
interface FunnelStep {
  label: string;
  value: number;
}

const props = defineProps<{
  steps: FunnelStep[];
  conversionRate: number;
}>();

const hasData = computed(() => props.steps.some((step) => step.value > 0));

const getBarWidth = (value: number): number => {
  if (!props.steps.length || !props.steps[0]?.value) return 0;
  const maxValue = Math.max(...props.steps.map((s) => s.value));
  return (value / maxValue) * 100;
};

const getConversionRate = (index: number): string => {
  const currentStep = props.steps[index];
  const nextStep = props.steps[index + 1];
  if (!currentStep?.value || !nextStep?.value) return "0";
  const rate = Math.min((nextStep.value / currentStep.value) * 100, 100);
  return rate.toFixed(1);
};
</script>
