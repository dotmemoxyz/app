<template>
  <div class="flex w-full flex-col gap-8">
    <!-- Top analytics -->
    <div class="flex w-full gap-4">
      <div class="flex items-center gap-[24px] rounded-[24px] bg-surface-card p-4">
        <div class="size-51 flex items-center justify-center rounded-[8px] bg-accent-primary-light p-[14px]">
          <Icon name="memo:people" class="size-[22px] text-accent-primary-dark" />
        </div>
        <div class="flex flex-col justify-between gap-[6px]">
          <h3 class="text-[20px] font-medium leading-[25px]">{{ dropCount ?? 0 }}</h3>
          <p class="text-[14px] font-normal leading-[18px] !text-[#606060]">{{ $t("manage.analytics.totalClaims") }}</p>
        </div>
      </div>
    </div>
    <!-- Table -->
    <div class="flex items-center justify-between">
      <h2 class="text-[24px]">
        {{ ownership === "created" ? $t("manage.analytics.recentClaims") : $t("manage.analytics.holders") }}
      </h2>

      <div class="flex gap-4">
        <!-- Pagination -->
        <div v-if="drops" class="flex gap-2">
          <dot-button
            :disabled="page === 1"
            variant="tertiary"
            class="flex !h-[45px] items-center gap-1"
            @click="prevPage"
          >
            <Icon name="mdi:chevron-left" class="size-[24px]" />
          </dot-button>
          <dot-button
            :disabled="drops.length < PAGE_SIZE || page * PAGE_SIZE >= (dropCount ?? 0)"
            variant="tertiary"
            class="flex !h-[45px] items-center gap-1"
            @click="nextPage"
          >
            <Icon name="mdi:chevron-right" class="size-[24px]" />
          </dot-button>
        </div>
        <dot-button class="!h-[45px]" variant="secondary" @click="exportCsv">
          {{ $t("manage.analytics.exportCsv") }}
        </dot-button>
      </div>
    </div>
    <div class="w-full overflow-x-scroll">
      <table v-if="drops" class="transaction-table w-full">
        <thead>
          <tr>
            <th>{{ $t("manage.analytics.table.claimId") }}</th>
            <th>{{ $t("manage.analytics.table.address") }}</th>
            <th>{{ $t("manage.analytics.table.time") }}</th>
            <th>{{ $t("manage.analytics.table.transaction") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in drops" :key="item.id">
            <td>#{{ item.id.split("-").at(1) }}</td>
            <td>{{ addressShortener(item.currentOwner) }}</td>
            <td>{{ getTimeFormat(item.createdAt) }}</td>
            <td>
              <span class="flex items-center gap-1">
                <a target="_blank" :href="getTxLink(item.blockNumber)"> {{ item.blockNumber }} </a>
                <Icon name="mdi:arrow-top-right" class="size-[16px] text-black" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="drops?.length === 0" class="flex h-[200px] w-full items-center justify-center">
        <p class="text-[16px] font-medium">{{ $t("manage.analytics.table.noTransactionsYet") }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getClient } from "@kodadot1/uniquery";
import { DateTime, Duration } from "luxon";
import type { Memo, Ownership } from "~/types/memo";

const props = defineProps<{
  drop: Memo;
  ownership: Ownership;
}>();

const getTxLink = (blockNumber: string) => {
  if (props.drop.chain === "ahp") {
    return `https://assethub-polkadot.subscan.io/block/${blockNumber}`;
  }

  return `https://assethub-kusama.subscan.io/block/${blockNumber}`;
};

type Item = {
  id: string;
  createdAt: string;
  currentOwner: string;
  image: string;
  issuer: string;
  metadata: string;
  name: string;
  blockNumber: string;
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

const { data: drops } = await useAsyncData(
  `transactions-drop-${props.drop.id}`,
  () => {
    const client = getClient(props.drop.chain);
    const query = client.itemListByCollectionId(props.drop.id, {
      offset: (page.value - 1) * PAGE_SIZE,
      orderBy: "createdAt_ASC",
      limit: PAGE_SIZE,
      fields: ["id", "createdAt", "currentOwner", "image", "issuer", "metadata", "name", "blockNumber"],
    });
    return client.fetch<Query>(query);
  },
  {
    transform: ({ data }) => data.items,
    watch: [page],
  },
);

const { data: dropCount } = await useAsyncData(
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

const exportCsv = () => {
  if (!drops.value) {
    return;
  }
  const header = `${t("manage.analytics.table.claimId")},${t("manage.analytics.table.address")},${t("manage.analytics.table.time")},${t("manage.analytics.table.transaction")}\n`;
  const csv = drops.value
    .map((item) => {
      return `${item.id.split("-").at(1)},${item.currentOwner},${getTimeFormat(item.createdAt)},${item.blockNumber}`;
    })
    .join("\n");
  const blob = new Blob([header + csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${props.drop.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
<style scoped>
.transaction-table {
  @apply w-full;

  th {
    @apply py-[24px] text-start text-[14px];
  }

  td {
    @apply py-[24px] text-start text-[14px];
  }

  tr {
    @apply border-b border-[#E5E5E5];
  }
}
</style>
