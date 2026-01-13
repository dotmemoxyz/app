<template>
  <div class="flex h-full flex-col gap-3">
    <div
      v-if="loading"
      class="flex h-[300px] items-center justify-center rounded-xl bg-surface-card text-text-secondary"
    >
      <div class="flex flex-col items-center gap-2">
        <Icon name="svg-spinners:90-ring-with-bg" class="size-6 animate-spin" />
        <span class="text-[14px]">Loading map data...</span>
      </div>
    </div>

    <div v-else-if="!displayLocations.length" class="py-4 text-center text-text-secondary">
      {{ $t("manage.analytics.noLocations") }}
    </div>

    <div
      v-else
      ref="containerRef"
      class="relative min-h-[300px] w-full flex-1 overflow-hidden rounded-xl bg-surface-card p-4"
      :class="{ 'cursor-grab': zoomLevel > 1, 'cursor-grabbing': isSwiping }"
    >
      <div
        class="absolute inset-0"
        :class="{ 'transition-transform duration-200 ease-out': !isSwiping }"
        :style="{ transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)` }"
      >
        <Chart type="choropleth" :data="chartData" :options="chartOptions" />
      </div>
      <div class="absolute bottom-4 left-4 flex flex-col gap-2">
        <button
          class="hover:bg-surface-default flex size-8 items-center justify-center rounded-lg bg-surface-white text-text-primary shadow-sm ring-1 ring-border-default disabled:opacity-50"
          type="button"
          :disabled="zoomLevel >= 3"
          @click="zoomIn"
        >
          <Icon name="mdi:plus" class="size-5" />
        </button>
        <button
          class="hover:bg-surface-default flex size-8 items-center justify-center rounded-lg bg-surface-white text-text-primary shadow-sm ring-1 ring-border-default disabled:opacity-50"
          type="button"
          :disabled="zoomLevel <= 1"
          @click="zoomOut"
        >
          <Icon name="mdi:minus" class="size-5" />
        </button>
        <button
          class="hover:bg-surface-default flex size-8 items-center justify-center rounded-lg bg-surface-white text-text-primary shadow-sm ring-1 ring-border-default disabled:opacity-50"
          type="button"
          :disabled="zoomLevel === 1"
          @click="resetZoom"
        >
          <Icon name="mdi:refresh" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from "chartjs-chart-geo";
import { feature } from "topojson-client";
import { Chart } from "vue-chartjs";
import { usePointerSwipe } from "@vueuse/core";
import type { LocationData } from "~/types/analytics";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale,
);

const props = defineProps<{
  locations: LocationData[];
  limit?: number;
}>();

const { data: worldAtlasData, status } = useFetch("https://unpkg.com/world-atlas@2.0.2/countries-50m.json", {
  key: "world-atlas-countries",
  lazy: true,
});

const loading = computed(() => status.value === "pending");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countries = computed<any[]>(() => {
  if (!worldAtlasData.value) return [];
  // @ts-expect-error topojson types
  return feature(worldAtlasData.value, worldAtlasData.value.objects.countries).features;
});

const colorMode = useColorMode();
const containerRef = ref<HTMLElement | null>(null);

const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const panOffset = { x: 0, y: 0 };

const { isSwiping, posStart, posEnd } = usePointerSwipe(containerRef, {
  threshold: 0,
  onSwipeStart: () => {
    panOffset.x = panX.value;
    panOffset.y = panY.value;
  },
});

watch([posStart, posEnd], () => {
  if (!isSwiping.value || zoomLevel.value <= 1) return;
  const deltaX = posEnd.x - posStart.x;
  const deltaY = posEnd.y - posStart.y;
  const maxPan = (zoomLevel.value - 1) * 100;
  panX.value = Math.max(-maxPan, Math.min(maxPan, panOffset.x + deltaX / zoomLevel.value));
  panY.value = Math.max(-maxPan, Math.min(maxPan, panOffset.y + deltaY / zoomLevel.value));
});

const displayLocations = computed(() => props.locations);

const chartData = computed(() => {
  if (!countries.value.length) return { labels: [], datasets: [] };

  return {
    labels: countries.value.map((d) => d.properties.name),
    datasets: [
      {
        label: "Countries",
        data: countries.value.map((d) => {
          const countryName = d.properties.name;
          const loc = props.locations.find((l) => {
            const mappedName = getCountryName(l.countryCode);
            return mappedName === countryName || l.countryCode === countryName;
          });
          return { feature: d, value: loc ? loc.count : 0 };
        }),
      },
    ],
  };
});

const chartOptions = computed(() => {
  const isDark = colorMode.value === "dark";
  const [targetR, targetG, targetB] = isDark ? [85, 243, 154] : [0, 173, 64];
  const [baseR, baseG, baseB] = isDark ? [55, 65, 81] : [243, 244, 246];

  return {
    responsive: true,
    maintainAspectRatio: false,
    showOutline: true,
    showGraticule: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `${ctx.chart.data.labels[ctx.dataIndex]}: ${ctx.raw.value}`,
        },
      },
    },
    scales: {
      projection: { axis: "x" as const, projection: "equalEarth" },
      color: {
        axis: "x" as const,
        quantize: 5,
        interpolate: (v: number) => {
          if (v === 0) return isDark ? "#374151" : "#f3f4f6";
          return `rgb(${Math.round(baseR - (baseR - targetR) * v)}, ${Math.round(baseG - (baseG - targetG) * v)}, ${Math.round(baseB - (baseB - targetB) * v)})`;
        },
      },
    },
  };
});

const zoomIn = () => {
  if (zoomLevel.value < 3) zoomLevel.value += 0.5;
};

const zoomOut = () => {
  zoomLevel.value = Math.max(1, zoomLevel.value - 0.5);
  if (zoomLevel.value === 1) {
    panX.value = 0;
    panY.value = 0;
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
};
</script>
