<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    <template v-if="loading">
      <DotSkeleton v-for="i in 4" :key="i" class="h-[100px] sm:h-[110px]" roundness="lg" />
    </template>

    <template v-else>
      <!-- Total Claims -->
      <div class="flex items-center gap-[24px] rounded-[24px] bg-surface-card p-4">
        <div
          class="flex size-[51px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light p-[14px]"
        >
          <Icon name="memo:people" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col justify-between gap-[6px]">
          <div class="flex items-center gap-2">
            <h3 class="text-[20px] font-medium leading-[25px]">{{ totalClaims }}</h3>
            <span v-if="stats.totalClaimsTrend !== 0" class="text-[12px] text-accent-primary-dark">
              ({{ stats.totalClaimsTrend > 0 ? "+" : "" }}{{ stats.totalClaimsTrend }}%
              {{ stats.totalClaimsTrend > 0 ? "▲" : "▼" }})
            </span>
          </div>
          <p class="text-[14px] font-normal leading-[18px] text-[#606060]">{{ $t("manage.analytics.totalClaims") }}</p>
        </div>
      </div>

      <!-- Claim Rate -->
      <div class="flex items-center gap-[24px] rounded-[24px] bg-surface-card p-4">
        <div
          class="flex size-[51px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light p-[14px]"
        >
          <Icon name="mdi:trending-up" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col justify-between gap-[6px]">
          <div class="flex items-center gap-2">
            <h3 class="text-[20px] font-medium leading-[25px]">{{ stats.claimRate }}%</h3>
            <span v-if="stats.claimRateTrend !== 0" class="text-[12px] text-accent-primary-dark">
              ({{ stats.claimRateTrend > 0 ? "+" : "" }}{{ stats.claimRateTrend }}%
              {{ stats.claimRateTrend > 0 ? "▲" : "▼" }})
            </span>
          </div>
          <p class="text-[14px] font-normal leading-[18px] text-[#606060]">{{ $t("manage.analytics.claimRate") }}</p>
        </div>
      </div>

      <!-- Daily Average -->
      <div class="flex items-center gap-[24px] rounded-[24px] bg-surface-card p-4">
        <div
          class="flex size-[51px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light p-[14px]"
        >
          <Icon name="mdi:chart-bar" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col justify-between gap-[6px]">
          <div class="flex items-center gap-2">
            <h3 class="text-[20px] font-medium leading-[25px]">{{ stats.dailyAvg }}/day</h3>
            <span v-if="stats.dailyAvgTrend !== 0" class="text-[12px] text-accent-primary-dark">
              ({{ stats.dailyAvgTrend > 0 ? "+" : "" }}{{ stats.dailyAvgTrend }}%
              {{ stats.dailyAvgTrend > 0 ? "▲" : "▼" }})
            </span>
          </div>
          <p class="text-[14px] font-normal leading-[18px] text-[#606060]">{{ $t("manage.analytics.dailyAvg") }}</p>
        </div>
      </div>

      <!-- Peak -->
      <div class="flex items-center gap-[24px] rounded-[24px] bg-surface-card p-4">
        <div
          class="flex size-[51px] shrink-0 items-center justify-center rounded-[8px] bg-accent-primary-light p-[14px]"
        >
          <Icon name="mdi:fire" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col justify-between gap-[6px]">
          <div class="flex items-center gap-2">
            <h3 class="text-[20px] font-medium leading-[25px]">{{ stats.peakClaims }}</h3>
            <span v-if="peakDaysAgo > 0" class="text-[12px] text-[#606060]">({{ peakDaysAgo }}d ago)</span>
          </div>
          <p class="text-[14px] font-normal leading-[18px] text-[#606060]">{{ $t("manage.analytics.peak") }}</p>
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
}));

const peakDaysAgo = computed(() => {
  if (!stats.value.peakDate) return 0;
  const peakDate = DateTime.fromISO(stats.value.peakDate);
  return Math.floor(DateTime.now().diff(peakDate, "days").days);
});
</script>
