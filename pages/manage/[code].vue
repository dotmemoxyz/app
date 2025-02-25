<template>
  <div class="flex h-full w-full flex-col gap-8 px-8 py-10">
    <div class="w-full">
      <div
        class="flex w-fit cursor-pointer items-center justify-between rounded-xl border border-black bg-white p-4 hover:opacity-70"
        @click="navigateTo('/manage')"
      >
        <Icon name="mdi:arrow-left" class="size-[20px] text-black" />
        <p class="text-[14px] font-normal !text-black">{{ $t("manage.drop.backToDrops") }}</p>
      </div>
    </div>
    <manage-drop-detail v-if="data" :drop="data" />
    <div v-else class="w-full rounded-xl bg-[#F9F9F9] p-10" />
    <div v-if="status === 'error'">
      <p>{{ error }}</p>
    </div>
    <!-- Tabs -->
    <div class="flex w-fit gap-[6px] rounded-[18px] bg-[#F9F9F9] p-2">
      <div
        v-for="tab in TABS"
        :key="tab.key"
        class="cursor-pointer items-center justify-center rounded-xl border px-[16px] py-[14px]"
        :class="{
          'border-black/15 bg-white': selectedTab === tab.key,
          'border-transparent': selectedTab !== tab.key,
        }"
        @click="selectedTab = tab.key"
      >
        <p class="text-[14px] !text-black">{{ tab.label }}</p>
      </div>
    </div>
    <hr class="w-full" />
    <!-- Sub containers -->
    <manage-drop-analytics v-if="selectedTab === 'analytics' && data" :drop="data" />
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";
import { getFreeMints } from "~/utils/sdk/query";

const { t } = useI18n();
const TABS = [
  { key: "analytics", label: t("manage.drop.tabs.analytics") },
  { key: "customize", label: t("manage.drop.tabs.customize") },
  { key: "settings", label: t("manage.drop.tabs.settings") },
];

const selectedTab = ref(TABS[0].key);

const route = useRoute();
const { data, status, error } = await useFetch("/api/code", {
  query: { code: route.params.code },
  watch: false,
});
const maxMints = ref(0);
const minted = ref(0);
const remaining = ref(0);
const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
const loadingLimitInfo = ref(true);
watch(
  data,
  async (data) => {
    if (data) {
      loadingLimitInfo.value = true;
      const api = await apiInstanceByPrefix(data.chain);

      const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(api, data.collection);
      maxMints.value = maxTokens;
      minted.value = mintedTokens;
      remaining.value = remainingMints;
      loadingLimitInfo.value = false;
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>
