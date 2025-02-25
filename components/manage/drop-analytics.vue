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
      <div
        class="flex h-fit cursor-pointer items-center gap-2 rounded-xl border border-black bg-white p-2 hover:opacity-70"
      >
        <p class="text-[14px] !text-black">{{ $t("manage.analytics.exportCsv") }}</p>
        <Icon name="mdi:export" class="size-[24px] text-black" />
      </div>
    </div>
    <table class="transaction-table w-full">
      <thead>
        <tr>
          <th>{{ $t("manage.analytics.table.claimId") }}</th>
          <th>{{ $t("manage.analytics.table.address") }}</th>
          <th>{{ $t("manage.analytics.table.claimedAt") }}</th>
          <th>{{ $t("manage.analytics.table.transaction") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in MOCK_TABLE_DATA" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.address }}</td>
          <td>{{ item.claimTimestamp }}</td>
          <td>
            <span class="flex items-center gap-1">
              <a :href="getTxLink(item.txId)">
                {{ item.txId }}
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
const MOCK_TABLE_DATA = [
  {
    id: 1,
    address: "0x1234567890",
    claimTimestamp: "2022-01-01 12:00:00",
    txId: "0x1234567890",
  },
  {
    id: 2,
    address: "0x1234567890",
    claimTimestamp: "2022-01-01 12:00:00",
    txId: "0x1234567890",
  },
  {
    id: 3,
    address: "0x1234567890",
    claimTimestamp: "2022-01-01 12:00:00",
    txId: "0x1234567890",
  },
  {
    id: 4,
    address: "0x1234567890",
    claimTimestamp: "2022-01-01 12:00:00",
    txId: "0x1234567890",
  },
  {
    id: 5,
    address: "0x1234567890",
    claimTimestamp: "2022-01-01 12:00:00",
    txId: "0x1234567890",
  },
];
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
