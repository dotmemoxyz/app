<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <template v-if="loading">
      <DotSkeleton v-for="i in 4" :key="i" class="h-[80px] sm:h-[88px]" roundness="md" />
    </template>

    <template v-else>
      <!-- Total Claims -->
      <div class="flex items-center gap-3 rounded-[16px] bg-surface-card p-3 sm:gap-4 sm:p-4">
        <div
          class="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light sm:size-[48px]"
        >
          <Icon name="memo:people" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[14px] text-text-secondary">{{ $t("manage.analytics.totalClaims") }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[20px] font-semibold sm:text-[24px]">{{ totalClaims }}</span>
            <span v-if="stats.totalClaimsTrend !== 0" class="text-[12px] text-accent-primary-dark">
              ({{ stats.totalClaimsTrend > 0 ? "+" : "" }}{{ stats.totalClaimsTrend }}%
              {{ stats.totalClaimsTrend > 0 ? "▲" : "▼" }})
            </span>
          </div>
        </div>
      </div>

      <!-- Claim Rate -->
      <div class="flex items-center gap-3 rounded-[16px] bg-surface-card p-3 sm:gap-4 sm:p-4">
        <div
          class="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light sm:size-[48px]"
        >
          <Icon name="mdi:trending-up" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[14px] text-text-secondary">{{ $t("manage.analytics.claimRate") }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[20px] font-semibold sm:text-[24px]">{{ stats.claimRate }}%</span>
            <span v-if="stats.claimRateTrend !== 0" class="text-[12px] text-accent-primary-dark">
              ({{ stats.claimRateTrend > 0 ? "+" : "" }}{{ stats.claimRateTrend }}%
              {{ stats.claimRateTrend > 0 ? "▲" : "▼" }})
            </span>
          </div>
        </div>
      </div>

      <!-- Daily Average -->
      <div class="flex items-center gap-3 rounded-[16px] bg-surface-card p-3 sm:gap-4 sm:p-4">
        <div
          class="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light sm:size-[48px]"
        >
          <Icon name="mdi:chart-bar" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[14px] text-text-secondary">{{ $t("manage.analytics.dailyAvg") }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[20px] font-semibold sm:text-[24px]">{{ stats.dailyAvg }}/day</span>
            <span v-if="stats.dailyAvgTrend !== 0" class="text-[12px] text-accent-primary-dark">
              ({{ stats.dailyAvgTrend > 0 ? "+" : "" }}{{ stats.dailyAvgTrend }}%
              {{ stats.dailyAvgTrend > 0 ? "▲" : "▼" }})
            </span>
          </div>
        </div>
      </div>

      <!-- Peak -->
      <div class="flex items-center gap-3 rounded-[16px] bg-surface-card p-3 sm:gap-4 sm:p-4">
        <div
          class="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light sm:size-[48px]"
        >
          <Icon name="mdi:fire" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[14px] text-text-secondary">{{ $t("manage.analytics.peak") }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[20px] font-semibold sm:text-[24px]">{{ stats.peakClaims }}</span>
            <span v-if="peakDaysAgo > 0" class="text-[12px] text-text-secondary">({{ peakDaysAgo }}d ago)</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { DateTime } from "luxon";
import type { AnalyticsStatsResponse } from "~/types/analytics";

const props = defineProps<{
  statsData?: AnalyticsStatsResponse | null;
  totalClaims: number;
  loading?: boolean;
}>();

const stats = computed(() => ({
  totalClaimsTrend: props.statsData?.totalClaimsTrend ?? 0,
  claimRate: props.statsData?.claimRate ?? 0,
  claimRateTrend: props.statsData?.claimRateTrend ?? 0,
  dailyAvg: props.statsData?.dailyAvg ?? 0,
  dailyAvgTrend: props.statsData?.dailyAvgTrend ?? 0,
  peakClaims: props.statsData?.peakClaims ?? 0,
  peakDate: props.statsData?.peakDate ?? "",
  conversionRate: props.statsData?.conversionRate ?? 0,
}));

const peakDaysAgo = computed(() => {
  if (!stats.value.peakDate) return 0;
  const peakDate = DateTime.fromISO(stats.value.peakDate);
  return Math.floor(DateTime.now().diff(peakDate, "days").days);
});
</script>
