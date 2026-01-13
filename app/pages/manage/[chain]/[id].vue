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
      <dot-tabs v-if="ownership === 'created'" v-model="selectedTab" :options="TABS" size="lg" />

      <hr class="w-full border-border-default" />

      <!-- Sub containers -->
      <manage-drop-analytics v-if="selectedTab === 'analytics' && data" :ownership="ownership" :drop="data" />
      <manage-drop-customize v-if="ownership === 'created' && selectedTab === 'customize' && data" :drop="data" />
      <manage-drop-settings
        v-if="ownership === 'created' && selectedTab === 'settings' && data"
        :drop="data"
        @saved="refresh"
      />
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
  { value: "analytics", label: t("manage.drop.tabs.analytics") },
  { value: "customize", label: t("manage.drop.tabs.customize") },
  { value: "settings", label: t("manage.drop.tabs.settings") },
];

const tabValues = TABS.map((tab) => tab.value);
const initialTab = tabValues.includes(route.query.tab as string) ? (route.query.tab as string) : TABS[0]!.value;
const selectedTab = ref(initialTab);

watch(selectedTab, (tabValue) => {
  router.replace({
    query: { ...route.query, tab: tabValue },
  });
});

const { data, status, error, refresh } = useFetch(
  `/api/manage/${ownership.value}/${route.params.chain}/${route.params.id}`,
);
</script>
