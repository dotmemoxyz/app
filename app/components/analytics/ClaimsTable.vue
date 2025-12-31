<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <h2 class="text-[18px] font-medium sm:text-[20px]">{{ $t("manage.analytics.recentClaims") }}</h2>
      <div class="flex gap-2">
        <div v-if="claims.length" class="flex gap-2">
          <dot-button
            :disabled="page === 1"
            variant="tertiary"
            class="flex !h-[40px] items-center gap-1 sm:!h-[45px]"
            @click="$emit('prev-page')"
          >
            <Icon name="mdi:chevron-left" class="size-[24px]" />
          </dot-button>
          <dot-button
            :disabled="claims.length < pageSize || page * pageSize >= totalCount"
            variant="tertiary"
            class="flex !h-[40px] items-center gap-1 sm:!h-[45px]"
            @click="$emit('next-page')"
          >
            <Icon name="mdi:chevron-right" class="size-[24px]" />
          </dot-button>
        </div>
        <dot-button class="!h-[40px] sm:!h-[45px]" variant="secondary" @click="$emit('export')">
          {{ $t("manage.analytics.exportCsv") }}
          <template #icon>
            <Icon name="mdi:chevron-down" class="size-[16px]" />
          </template>
        </dot-button>
      </div>
    </div>

    <div class="w-full overflow-x-auto">
      <table v-if="claims.length" class="claims-table w-full">
        <thead>
          <tr>
            <th>{{ $t("manage.analytics.table.claimId") }}</th>
            <th>{{ $t("manage.analytics.table.address") }}</th>
            <th class="hidden sm:table-cell">{{ $t("manage.analytics.table.time") }}</th>
            <th>{{ $t("manage.analytics.table.transaction") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in claims" :key="item.id">
            <td>#{{ item.id.split("-").at(1) }}</td>
            <td>{{ shortenAddress(item.currentOwner) }}</td>
            <td class="hidden sm:table-cell">{{ formatTime(item.createdAt) }}</td>
            <td>
              <a
                target="_blank"
                :href="getTxLink(item.blockNumber)"
                class="flex items-center gap-1 text-text-primary hover:underline"
              >
                view
                <Icon name="mdi:arrow-top-right" class="size-[14px]" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="flex h-[200px] w-full items-center justify-center">
        <p class="text-[16px] text-text-secondary">{{ $t("manage.analytics.table.noTransactionsYet") }}</p>
      </div>
    </div>

    <div v-if="claims.length" class="flex items-center justify-between">
      <span class="text-[12px] text-text-secondary sm:text-[14px]">
        {{
          $t("manage.analytics.showing", {
            from: (page - 1) * pageSize + 1,
            to: Math.min(page * pageSize, totalCount),
            total: totalCount,
          })
        }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";

interface Claim {
  id: string;
  createdAt: string;
  currentOwner: string;
  blockNumber: string;
}

const props = defineProps<{
  claims: Claim[];
  page: number;
  pageSize: number;
  totalCount: number;
  chain: Prefix;
}>();

defineEmits<{
  "prev-page": [];
  "next-page": [];
  export: [];
}>();

const shortenAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatTime = (dateRaw: string): string => {
  const date = new Date(dateRaw);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays > 0) {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`;
  }
  if (diffMins > 0) {
    return `${diffMins}m ago`;
  }
  return "Just now";
};

const getTxLink = (blockNumber: string): string => {
  if (props.chain === "ahp") {
    return `https://assethub-polkadot.subscan.io/block/${blockNumber}`;
  }
  return `https://assethub-kusama.subscan.io/block/${blockNumber}`;
};
</script>

<style scoped>
.claims-table {
  @apply w-full;

  th {
    @apply py-3 text-start text-[13px] font-normal text-text-secondary sm:py-4 sm:text-[14px];
  }

  td {
    @apply py-3 text-start text-[13px] sm:py-4 sm:text-[14px];
  }

  tr {
    @apply border-b border-border-default;
  }

  tbody tr:hover {
    @apply bg-surface-card/50;
  }
}
</style>
