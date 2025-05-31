<template>
  <div class="flex h-full w-full flex-col gap-8 py-10">
    <div class="w-full">
      <dot-button variant="secondary" @click="navigateTo('/manage?chain=' + data?.chain)">
        <template #icon>
          <Icon name="mdi:arrow-left" class="size-[20px] text-text-primary" />
        </template>
        {{ $t("manage.drop.backToDrops") }}
      </dot-button>
    </div>
    <manage-drop-detail v-if="data" :drop="data" />
    <div v-else class="w-full rounded-xl bg-surface-card p-10" />
    <div v-if="status === 'error'">
      <p>{{ error }}</p>
    </div>
    <!-- Tabs -->
    <div class="flex w-fit gap-[6px] rounded-[18px] bg-surface-card p-[6px]">
      <div
        v-for="tab in TABS"
        :key="tab.key"
        class="cursor-pointer items-center justify-center rounded-xl border px-[16px] py-[14px]"
        :class="{
          'border-black/15 bg-surface-white': selectedTab === tab.key,
          'border-transparent': selectedTab !== tab.key,
        }"
        @click="selectedTab = tab.key"
      >
        <p class="text-[14px] font-normal leading-[18px]">{{ tab.label }}</p>
      </div>
    </div>
    <hr class="w-full" />
    <!-- Sub containers -->
    <manage-drop-analytics v-if="selectedTab === 'analytics' && data" :drop="data" />
    <manage-drop-customize v-if="selectedTab === 'customize' && data" :drop="data" />
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const TABS = [
  { key: "analytics", label: t("manage.drop.tabs.analytics") },
  { key: "customize", label: t("manage.drop.tabs.customize") },
  { key: "settings", label: t("manage.drop.tabs.settings") },
];

const selectedTab = ref(TABS[0].key);

const route = useRoute();
const { data, status, error } = await useFetch(`/api/drop/${route.params.chain}/${route.params.code}`);
</script>
