<template>
  <div class="flex w-full flex-col gap-8">
    <!-- Top analytics -->
    <div class="flex w-full gap-4">
      <div class="flex items-center gap-4 rounded-xl bg-[#F9F9F9] p-4">
        <div class="size-51 flex items-center justify-center rounded-lg bg-[#55F39A] p-3">
          <Icon name="memo:people" class="size-[22px] text-black" />
        </div>
        <div class="flex flex-col justify-between">
          <h3 class="text-[20px] !text-black">30</h3>
          <p class="text-[14px] !text-[#606060]">{{ $t("manage.analytics.totalClaims") }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4 rounded-xl bg-[#F9F9F9] p-4">
        <div class="size-51 flex items-center justify-center rounded-lg bg-white p-3">
          <Icon name="memo:fingerprint" class="size-[22px] text-black" />
        </div>
        <div class="flex flex-col justify-between">
          <h3 class="text-[20px] !text-black">14</h3>
          <p class="text-[14px] !text-[#606060]">{{ $t("manage.analytics.uniqueAddresses") }}</p>
        </div>
      </div>
    </div>
    <!-- Table -->
    <div class="flex items-center justify-between">
      <h2 class="text-[24px] !text-black">{{ $t("manage.analytics.recentClaims") }}</h2>

      <div class="flex gap-4">
        <!-- Pagination -->
        <div v-if="data" class="flex gap-2">
          <dot-button :disabled="page === 1" variant="tertiary" class="flex items-center gap-1" @click="prevPage">
            <Icon name="mdi:chevron-left" class="size-[16px]" />
          </dot-button>
          <dot-button
            :disabled="data.length < PAGE_SIZE"
            variant="tertiary"
            class="flex items-center gap-1"
            @click="nextPage"
          >
            <Icon name="mdi:chevron-right" class="size-[16px]" />
          </dot-button>
        </div>
        <div
          class="flex h-fit cursor-pointer items-center gap-2 rounded-xl border border-black bg-white p-2 hover:opacity-70"
        >
          <p class="text-[14px] !text-black">{{ $t("manage.analytics.exportCsv") }}</p>
          <Icon name="mdi:export" class="size-[24px] text-black" />
        </div>
      </div>
    </div>
    <table v-if="data" class="transaction-table w-full">
      <thead>
        <tr>
          <th>{{ $t("manage.analytics.table.claimId") }}</th>
          <th>{{ $t("manage.analytics.table.address") }}</th>
          <th>{{ $t("manage.analytics.table.time") }}</th>
          <th>{{ $t("manage.analytics.table.transaction") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id.split("-").at(1) }}</td>
          <td>{{ addressShortener(item.currentOwner) }}</td>
          <td>{{ getTimeFormat(item.createdAt) }}</td>
          <td>
            <span class="flex items-center gap-1">
              <a :href="getTxLink('0x123123123')">
                {{ "0x123123123" }}
              </a>
              <Icon name="mdi:arrow-top-right" class="size-[16px] text-black" />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { getClient } from "@kodadot1/uniquery";
import { DateTime, Duration } from "luxon";
import type { Memo } from "~/types/memo";

const props = defineProps<{
  drop: Memo;
}>();

const getTxLink = (tx: string) => {
  if (props.drop.chain === "ahp") {
    return `https://assethub-polkadot.subscan.io/extrinsic/${tx}`;
  }

  return `https://assethub-kusama.subscan.io/extrinsic/${tx}`;
};

type Item = {
  createdAt: string;
  currentOwner: string;
  id: string;
  image: string;
  issuer: string;
  metadata: string;
  name: string;
};

type Query = {
  items: Item[];
};

const PAGE_SIZE = 20;

const page = ref(1);

const nextPage = () => {
  page.value += 1;
};

const prevPage = () => {
  page.value -= 1;
};

const { data } = await useAsyncData(
  `transactions-drop-${props.drop.id}`,
  () => {
    const client = getClient(props.drop.chain);
    const query = client.itemListByCollectionId(props.drop.collection, {
      offset: (page.value - 1) * PAGE_SIZE,
      orderBy: "createdAt_ASC",
      limit: PAGE_SIZE,
    });
    return client.fetch<Query>(query);
  },
  {
    transform: ({ data }) => data.items,
    watch: [page],
  },
);
const { t, locale } = useI18n();
const getTimeFormat = (dateRaw: string) => {
  const date = DateTime.fromISO(dateRaw);
  const diff = DateTime.now().diff(date, ["days", "hours", "minutes", "seconds"]);
  // Return remaining time with locale
  if (diff.days > 0) {
    return date.toFormat("yyyy-MM-dd HH:mm:ss");
  }
  if (diff.hours > 0) {
    return t("common.timeAgo", {
      time: Duration.fromObject({ hours: Math.round(diff.hours) }, { locale: locale.value }).toHuman(),
    });
  } else if (diff.minutes > 0) {
    return t("common.timeAgo", {
      time: Duration.fromObject({ minutes: Math.round(diff.minutes) }, { locale: locale.value }).toHuman(),
    });
  } else {
    return t("common.timeAgo", {
      time: Duration.fromObject({ seconds: Math.round(diff.seconds) }, { locale: locale.value }).toHuman(),
    });
  }
};
</script>
<style scoped>
.transaction-table {
  @apply w-full;

  th {
    @apply py-4 text-start text-[14px] !text-[#606060];
  }

  td {
    @apply py-4 text-start text-[14px] !text-black;
  }

  tr {
    @apply border-b border-[#E5E5E5];
  }
}
</style>
