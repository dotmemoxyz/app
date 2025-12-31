<template>
  <DotSkeleton v-if="loading" class="h-[280px] w-full" roundness="md" />

  <div v-else class="rounded-[16px] bg-surface-card p-4">
    <div class="mb-4 flex gap-2 border-b border-border-default pb-2">
      <button
        class="rounded-lg px-3 py-2 text-[14px] transition-colors"
        :class="
          activeTab === 'funnel' ? 'bg-surface-white text-text-primary' : 'hover:bg-surface-default text-text-secondary'
        "
        @click="activeTab = 'funnel'"
      >
        {{ $t("manage.analytics.funnel") }}
      </button>
      <button
        class="rounded-lg px-3 py-2 text-[14px] transition-colors"
        :class="
          activeTab === 'locations'
            ? 'bg-surface-white text-text-primary'
            : 'hover:bg-surface-default text-text-secondary'
        "
        @click="activeTab = 'locations'"
      >
        {{ $t("manage.analytics.locations") }}
      </button>
    </div>

    <AnalyticsFunnel v-if="activeTab === 'funnel'" :steps="funnelSteps" :conversion-rate="conversionRate" />

    <AnalyticsLocations v-if="activeTab === 'locations'" :locations="locations" />
  </div>
</template>

<script lang="ts" setup>
import type { LocationData } from "~/types/analytics";

interface FunnelStep {
  label: string;
  value: number;
}

defineProps<{
  funnelSteps: FunnelStep[];
  conversionRate: number;
  locations: LocationData[];
  loading?: boolean;
}>();

const activeTab = ref<"funnel" | "locations">("funnel");
</script>
