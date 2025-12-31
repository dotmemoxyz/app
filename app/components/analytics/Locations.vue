<template>
  <div class="flex flex-col gap-3">
    <div v-for="loc in displayLocations" :key="loc.country" class="flex items-center gap-3">
      <span class="text-[20px]">{{ loc.flag }}</span>
      <div class="w-20 text-[13px] sm:w-24 sm:text-[14px]">{{ loc.country }}</div>
      <div class="flex-1 overflow-hidden">
        <div class="bg-surface-default h-6 rounded">
          <div
            class="flex h-full items-center justify-end rounded bg-accent-primary-dark px-2 text-[11px] text-white"
            :style="{ width: `${getBarWidth(loc.count)}%` }"
          >
            {{ loc.count }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="!displayLocations.length" class="py-4 text-center text-text-secondary">
      {{ $t("manage.analytics.noLocations") }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { LocationData } from "~/types/analytics";

const props = defineProps<{
  locations: LocationData[];
  limit?: number;
}>();

const countryFlags: Record<string, string> = {
  US: "🇺🇸",
  DE: "🇩🇪",
  GB: "🇬🇧",
  CZ: "🇨🇿",
  FR: "🇫🇷",
  ES: "🇪🇸",
  IT: "🇮🇹",
  NL: "🇳🇱",
  PL: "🇵🇱",
  JP: "🇯🇵",
  KR: "🇰🇷",
  CN: "🇨🇳",
  IN: "🇮🇳",
  BR: "🇧🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
  RU: "🇷🇺",
  UA: "🇺🇦",
  TR: "🇹🇷",
  SE: "🇸🇪",
  CH: "🇨🇭",
  MX: "🇲🇽",
  AR: "🇦🇷",
  ZA: "🇿🇦",
  SG: "🇸🇬",
  HK: "🇭🇰",
  TW: "🇹🇼",
  TH: "🇹🇭",
  ID: "🇮🇩",
  MY: "🇲🇾",
  PH: "🇵🇭",
  VN: "🇻🇳",
  AE: "🇦🇪",
  SA: "🇸🇦",
  IL: "🇮🇱",
  EG: "🇪🇬",
  NG: "🇳🇬",
  KE: "🇰🇪",
  AT: "🇦🇹",
  BE: "🇧🇪",
  DK: "🇩🇰",
  FI: "🇫🇮",
  GR: "🇬🇷",
  IE: "🇮🇪",
  NO: "🇳🇴",
  PT: "🇵🇹",
  RO: "🇷🇴",
  HU: "🇭🇺",
  CL: "🇨🇱",
  CO: "🇨🇴",
  PE: "🇵🇪",
  NZ: "🇳🇿",
};

const countryNames: Record<string, string> = {
  US: "USA",
  DE: "Germany",
  GB: "UK",
  CZ: "Czech Rep",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  PL: "Poland",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  CA: "Canada",
  AU: "Australia",
  RU: "Russia",
  UA: "Ukraine",
  TR: "Turkey",
  SE: "Sweden",
  CH: "Switzerland",
  MX: "Mexico",
  AR: "Argentina",
  ZA: "South Africa",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  TH: "Thailand",
  ID: "Indonesia",
  MY: "Malaysia",
  PH: "Philippines",
  VN: "Vietnam",
  AE: "UAE",
  SA: "Saudi Arabia",
  IL: "Israel",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  AT: "Austria",
  BE: "Belgium",
  DK: "Denmark",
  FI: "Finland",
  GR: "Greece",
  IE: "Ireland",
  NO: "Norway",
  PT: "Portugal",
  RO: "Romania",
  HU: "Hungary",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  NZ: "New Zealand",
};

const displayLocations = computed(() => {
  const limit = props.limit ?? 5;
  return props.locations.slice(0, limit).map((loc) => ({
    flag: countryFlags[loc.countryCode] || "🌍",
    country: countryNames[loc.countryCode] || loc.countryCode,
    count: loc.count,
  }));
});

const maxCount = computed(() => Math.max(...displayLocations.value.map((l) => l.count), 1));

const getBarWidth = (count: number): number => {
  return (count / maxCount.value) * 100;
};
</script>
