<template>
  <DotSkeleton v-if="loading" class="h-[280px] w-full" roundness="md" />

  <div v-else class="flex h-full flex-col rounded-[16px] bg-surface-card p-4">
    <div class="mb-4 flex flex-none gap-2 border-b border-border-default pb-2">
      <button
        class="rounded-lg px-3 py-2 text-[14px] transition-colors"
        :class="
          activeTab === 'trend' ? 'bg-surface-white text-text-primary' : 'hover:bg-surface-default text-text-secondary'
        "
        @click="activeTab = 'trend'"
      >
        {{ $t("manage.analytics.trend") }}
      </button>
      <button
        class="rounded-lg px-3 py-2 text-[14px] transition-colors"
        :class="
          activeTab === 'hourly' ? 'bg-surface-white text-text-primary' : 'hover:bg-surface-default text-text-secondary'
        "
        @click="activeTab = 'hourly'"
      >
        {{ $t("manage.analytics.hourly") }}
      </button>
    </div>

    <div v-if="activeTab === 'trend'" class="relative min-h-[200px] w-full flex-1">
      <div v-if="!trendData.length" class="flex h-full flex-col items-center justify-center gap-2 text-text-secondary">
        <Icon name="mdi:chart-line" class="size-10 opacity-50" />
        <span class="text-[14px]">{{ $t("manage.analytics.noData") }}</span>
      </div>
      <div v-else class="absolute inset-0">
        <Line :data="trendChartData" :options="chartOptions" />
      </div>
    </div>

    <div v-if="activeTab === 'hourly'" class="relative min-h-[200px] w-full flex-1">
      <div v-if="!hasHourlyData" class="flex h-full flex-col items-center justify-center gap-2 text-text-secondary">
        <Icon name="mdi:chart-bar" class="size-10 opacity-50" />
        <span class="text-[14px]">{{ $t("manage.analytics.noData") }}</span>
      </div>
      <div v-else class="absolute inset-0">
        <Bar :data="hourlyChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "vue-chartjs";
import type { TrendDataPoint, HourlyDistributionPoint } from "~/types/analytics";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const props = defineProps<{
  trendData: TrendDataPoint[];
  distributionData: HourlyDistributionPoint[];
  loading?: boolean;
}>();

const activeTab = ref<"trend" | "hourly">("trend");

const hasHourlyData = computed(() => {
  return props.distributionData.some((d) => d.claims > 0);
});

const chartGreen = "#22c55e";
const chartGreenLight = "rgba(34, 197, 94, 0.2)";

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1f2937",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af" },
    },
    y: {
      grid: { color: "rgba(156, 163, 175, 0.1)" },
      ticks: {
        color: "#9ca3af",
        precision: 0,
        stepSize: 1,
      },
      beginAtZero: true,
    },
  },
};

const trendChartData = computed(() => ({
  labels: props.trendData.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }),
  datasets: [
    {
      label: "Claims",
      data: props.trendData.map((d) => d.claims),
      borderColor: chartGreen,
      backgroundColor: chartGreenLight,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}));

const hourlyChartData = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const claimsByHour = hours.map((hour) => {
    const found = props.distributionData.find((d) => d.hour === hour);
    return found?.claims ?? 0;
  });
  return {
    labels: hours.map((h) => h.toString().padStart(2, "0")),
    datasets: [
      {
        label: "Claims",
        data: claimsByHour,
        backgroundColor: chartGreen,
        borderRadius: 3,
        barThickness: 16,
      },
    ],
  };
});
</script>
