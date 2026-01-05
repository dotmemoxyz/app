<template>
  <div class="flex h-full w-full flex-col gap-8 py-10">
    <!-- Back button -->
    <div class="w-full">
      <dot-button variant="secondary" @click="navigateTo('/manage?chain=' + data?.chain)">
        <template #icon>
          <Icon name="mdi:arrow-left" class="size-[20px] text-text-primary" />
        </template>
        {{ $t("manage.drop.backToDrops") }}
      </dot-button>
    </div>

    <div v-if="status === 'error'">
      <p>{{ error }}</p>
    </div>

    <dot-skeleton v-else-if="!data" class="w-full p-10" roundness="md" />

    <template v-else>
      <manage-drop-detail v-if="data" :ownership="ownership" :drop="data" />

      <!-- Tabs -->
      <div v-if="ownership === 'created'" class="flex w-fit gap-[6px] rounded-[18px] bg-surface-card p-[6px]">
        <div
          v-for="tab in TABS"
          :key="tab.key"
          class="cursor-pointer items-center justify-center rounded-xl border px-[16px] py-[14px]"
          :class="{
            'border-black/15 bg-surface-white': selectedTab === tab.key,
            'border-transparent': selectedTab !== tab.key,
          }"
          @click="selectTab(tab.key)"
        >
          <p class="text-[14px] font-normal leading-[18px]">{{ tab.label }}</p>
        </div>
      </div>

      <hr class="w-full border-border-default" />

      <!-- Sub containers -->
      <manage-drop-analytics v-if="selectedTab === 'analytics' && data" :ownership="ownership" :drop="data" />
      <manage-drop-customize v-if="ownership === 'created' && selectedTab === 'customize' && data" :drop="data" />
      <manage-drop-settings v-if="ownership === 'created' && selectedTab === 'settings' && data" :drop="data" />
    </template>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

const { ownership } = useManageParams();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const TABS = [
  { key: "analytics", label: t("manage.drop.tabs.analytics") },
  { key: "customize", label: t("manage.drop.tabs.customize") },
  { key: "settings", label: t("manage.drop.tabs.settings") },
];

const tabKeys = TABS.map((tab) => tab.key);
const initialTab = tabKeys.includes(route.query.tab as string) ? (route.query.tab as string) : TABS[0]!.key;
const selectedTab = ref(initialTab);

const selectTab = (tabKey: string) => {
  selectedTab.value = tabKey;
  router.replace({
    query: { ...route.query, tab: tabKey },
  });
};

const { data, status, error } = await useFetch(
  `/api/manage/${ownership.value}/${route.params.chain}/${route.params.id}`,
);
</script>
