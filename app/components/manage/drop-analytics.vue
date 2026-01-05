<template>
  <div class="flex w-full flex-col gap-6">
    <template v-if="showStats">
      <AnalyticsTimeFilter v-model="selectedRange" />

      <AnalyticsStatsCards
        :stats-data="dashboardData?.stats"
        :total-claims="dropCount ?? 0"
        :loading="dashboardPending || countPending"
      />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnalyticsCharts
          :trend-data="dashboardData?.trend.data || []"
          :distribution-data="dashboardData?.distribution.data || []"
          :loading="dashboardPending"
        />

        <AnalyticsInsights
          :funnel-steps="funnel"
          :conversion-rate="dashboardData?.stats.conversionRate ?? 0"
          :locations="locations"
          :loading="dashboardPending"
        />
      </div>
    </template>

    <AnalyticsClaimsTable
      :claims="claims"
      :page="page"
      :page-size="PAGE_SIZE"
      :total-count="dropCount ?? 0"
      :chain="drop.chain"
      :ownership="ownership"
      :loading="dropsPending"
      @prev-page="prevPage"
      @next-page="nextPage"
      @export="exportCsv"
    />
  </div>
</template>

<script lang="ts" setup>
import { getClient } from "@kodadot1/uniquery";
import type { Memo, Ownership } from "~/types/memo";
import type { TimeRange, FunnelStep } from "~/types/analytics";
import type { ClaimItem } from "../analytics/types";

const props = defineProps<{
  drop: Memo;
  ownership: Ownership;
}>();

const { t } = useI18n();
const analytics = useAnalytics(props.drop.chain, props.drop.id);

const selectedRange = ref<TimeRange>("7d");

const showStats = computed(() => props.ownership === "created" || props.ownership === "organized");

const { data: dashboardData, pending: dashboardPending } = useAsyncData(
  `analytics-dashboard-${props.drop.id}`,
  () => analytics.fetchDashboard(selectedRange.value),
  { watch: [selectedRange], immediate: showStats.value },
);

const funnel = computed(() => {
  if (!dashboardData.value?.funnel.steps) return [];
  return dashboardData.value.funnel.steps.map((step: FunnelStep) => ({
    label: t(`manage.analytics.${step.step === "page_views" ? "pageViews" : step.step}`),
    value: step.value,
  }));
});

const locations = computed(() => dashboardData.value?.locations.locations || []);
const PAGE_SIZE = 20;
const page = ref(1);

const nextPage = () => {
  page.value += 1;
};

const prevPage = () => {
  page.value -= 1;
};

const { data: dropsData, pending: dropsPending } = useAsyncData(
  `transactions-drop-${props.drop.id}`,
  () => {
    const client = getClient(props.drop.chain);
    const query = client.itemListByCollectionId(props.drop.id, {
      offset: (page.value - 1) * PAGE_SIZE,
      orderBy: "createdAt_ASC",
      limit: PAGE_SIZE,
      fields: ["id", "createdAt", "currentOwner", "image", "issuer", "metadata", "name", "blockNumber"],
    });
    return client.fetch<{ items: ClaimItem[] }>(query);
  },
  {
    transform: ({ data }) => data.items,
    watch: [page],
  },
);

const claims = computed(() => dropsData.value || []);

const { data: dropCount, pending: countPending } = useAsyncData(
  `transactions-count-drop-${props.drop.id}`,
  () => {
    const client = getClient(props.drop.chain);
    const query = client.itemCountByCollectionId(props.drop.id);
    return client.fetch<{ itemCount: { totalCount: number } }>(query);
  },
  {
    transform: ({ data }) => data.itemCount.totalCount,
  },
);

const exportCsv = () => {
  analytics.exportCsv(selectedRange.value);
};
</script>
