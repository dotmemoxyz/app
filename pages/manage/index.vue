<template>
  <div class="flex h-full w-full flex-col py-[113px]">
    <h1 class="mb-[7px] space-x-3 text-center text-[40px] !text-black md:text-left dark:!text-white">
      <span
        class="cursor-pointer font-bold text-text-placeholder"
        :class="{ 'text-text-primary': urlParams.ownership === 'created' }"
        @click="urlParams.ownership = 'created'"
      >
        {{ $t("manage.created") }}
      </span>
      <span class="text-text-placeholder">/</span>
      <span
        class="cursor-pointer font-bold text-text-placeholder"
        :class="{ 'text-text-primary': urlParams.ownership === 'collected' }"
        @click="urlParams.ownership = 'collected'"
      >
        {{ $t("manage.collected") }}
      </span>
    </h1>
    <div class="my-[35px] flex w-full flex-wrap justify-between gap-8">
      <!-- Statistics -->
      <div class="flex w-full justify-evenly gap-4 md:w-auto">
        <!-- Active drops -->
        <div class="flex flex-col items-center gap-[21px] md:flex-row">
          <div
            class="flex aspect-square size-[75px] items-center justify-center rounded-full bg-accent-primary-light p-2"
          >
            <Icon name="memo:bar-chart" class="size-[37px] text-accent-primary-dark" />
          </div>
          <div class="flex flex-col items-center gap-[8px] md:items-start">
            <p class="text-[14px] leading-[17px] !text-text-secondary">{{ $t("manage.activeDrops") }}</p>
            <p class="text-[20px] font-medium leading-[26px]">{{ totalActiveDrops }}</p>
          </div>
        </div>
        <!-- Total claims -->
        <div class="flex flex-col items-center gap-[21px] md:flex-row">
          <div class="flex aspect-square size-[75px] items-center justify-center rounded-full bg-surface-blue p-2">
            <Icon name="memo:people" class="size-[34px] text-text-blue" />
          </div>
          <div class="flex flex-col items-center gap-[8px] md:items-start">
            <p class="text-[14px] leading-[17px] !text-text-secondary">{{ $t("manage.totalClaims") }}</p>
            <p class="text-[20px] font-medium leading-[26px]">{{ totalClaims }}</p>
          </div>
        </div>
      </div>
      <div class="flex w-full justify-center gap-2 md:w-auto">
        <!-- Chain select -->
        <DotButton variant="tertiary" @click="navigateTo('/create')">
          <span class="hidden md:block">{{ $t("manage.createDrop") }}</span>
          <Icon name="mdi:plus" size="24" class="md:hidden" />
        </DotButton>
      </div>
    </div>
    <hr class="my-[29px]" />
    <div class="flex gap-[16px]">
      <DotSelect v-model="filter" class="!w-fit" :options="FILTER_OPTIONS" />
      <DotSelect v-model="urlParams.chain" class="!w-fit" :options="chainList" />
    </div>
    <div class="mt-[35px] grid grid-cols-1 gap-[40px] md:grid-cols-3 md:justify-start">
      <template v-if="dropsStatus === 'pending' || !accountStore.loaded">
        <DotSkeleton v-for="i in 4" :key="i" class="h-[530px] w-full" roundness="lg" />
      </template>
      <template v-else-if="filteredDrops.length > 0">
        <ManageDropCard v-for="drop in filteredDrops" :key="drop.id" :drop="drop" :ownership="urlParams.ownership" />
      </template>
    </div>
    <div v-if="dropsError" class="flex w-full items-center justify-center">
      <p class="!text-red-500">{{ $t("manage.dropsError") }}</p>
    </div>
    <div
      v-else-if="dropsStatus === 'success' && filteredDrops.length === 0"
      class="flex w-full items-center justify-center"
    >
      <p class="text-center text-lg">{{ $t("manage.noDrops") }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getClient, type Prefix } from "@kodadot1/uniquery";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import type { Memo, Ownership, UniqCollection, UniqItem } from "~/types/memo";
import { $purify as purify } from "@kodadot1/minipfs";
import type { Option } from "~/types/components";
import { asyncComputed, useUrlSearchParams } from "@vueuse/core";
import { DateTime } from "luxon";

definePageMeta({
  middleware: "auth",
});

const accountStore = useAccountStore();

const urlParams = useUrlSearchParams<{
  chain: Prefix;
  ownership: Ownership;
}>("history", {
  initialValue: {
    chain: "ahp",
    ownership: "created",
  },
  removeFalsyValues: true,
  removeNullishValues: true,
});

onMounted(() => {
  if (!["created", "collected"].includes(urlParams.ownership)) {
    urlParams.ownership = "created";
  }
  if (!["ahp", "ahk"].includes(urlParams.chain)) {
    urlParams.chain = "ahp";
  }
});

type FilterOptions = "all" | "active" | "inactive";

const FILTER_OPTIONS = computed<Option[]>(() => [
  { text: "Show All", value: "all", info: "Show all drops" },
  { text: "Show Active", value: "active", info: "Show active drops" },
  { text: "Show Inactive", value: "inactive", info: "Show inactive drops" },
]);

const filter = ref<FilterOptions>("all");

const selectedAccount = computed(() => accountStore.selected);

type QueryCollectionsResponse<T extends Ownership> = {
  collections: T extends "created" ? UniqCollection[] : never;
  items: T extends "collected" ? UniqItem[] : never;
};

const chainList = computed<Option[]>(() => [
  { text: "Asset Hub Polkadot", value: "ahp", info: "Polkadot is a multi-chain network." },
  { text: "Asset Hub Kusama", value: "ahk", info: "Kusama is a canary network for Polkadot." },
]);

const client = computed(() => getClient(urlParams.chain));

const {
  data: drops,
  error: dropsError,
  status: dropsStatus,
} = useAsyncData(
  "drops",
  async () => {
    if (!accountStore.loaded) {
      return [];
    }
    if (!accountStore.selected?.address) {
      throw new Error("No account selected");
    }
    const address = encodeAddress(decodeAddress(accountStore.selected.address), urlParams.chain === "ahp" ? 0 : 2);
    const memos: Memo[] = [];
    if (urlParams.ownership === "collected") {
      const query = client.value.itemListCollectedBy(address, {
        fields: ["id", "name", "image"],
        orderBy: "createdAt_DESC",
        kind: "poap",
      });
      const resp = await client.value.fetch<QueryCollectionsResponse<"collected">>(query);
      for (const item of resp.data.items) {
        const id = item.id.split("-")[0];
        try {
          const data = await $fetch(`/api/drop/${urlParams.chain}/${id}`);
          const image = purify(item.image).at(0);
          if (!image) {
            throw new Error("No image found");
          }
          memos.push({
            ...data,
            id,
            name: item.name,
            image,
          });
        } catch (error) {
          console.error(`Error fetching drop data for collection ${id}:`, error);
        }
      }
    } else {
      const query = client.value.collectionListByOwner(address, {
        fields: ["id", "name", "image"],
        orderBy: "createdAt_DESC",
        kind: "poap",
      });

      const resp = await client.value.fetch<QueryCollectionsResponse<"created">>(query);

      for (const collection of resp.data.collections) {
        try {
          const data = await $fetch(`/api/drop/${urlParams.chain}/${collection.id}`);
          const image = purify(collection.image).at(0);
          if (!image) {
            throw new Error("No image found");
          }
          memos.push({
            ...data,
            name: collection.name,
            image,
          });
        } catch (error) {
          console.error(`Error fetching drop data for collection ${collection.id}:`, error);
        }
      }
    }
    return memos;
  },
  {
    watch: [urlParams, selectedAccount],
    immediate: true,
  },
);

const filteredDrops = computed(() => {
  if (!drops.value) {
    return [];
  }
  if (filter.value === "all") {
    return drops.value;
  }
  const now = DateTime.now();
  return drops.value.filter((drop) => {
    const createdAt = DateTime.fromISO(drop.createdAt);
    const expiredAt = DateTime.fromISO(drop.expiresAt);
    if (filter.value === "active") {
      return createdAt < now && expiredAt > now;
    } else if (filter.value === "inactive") {
      return expiredAt <= now;
    }
    return true; // Fallback to all if no filter matches
  });
});

const totalActiveDrops = computed(() => {
  if (!drops.value) {
    return 0;
  }
  return drops.value.reduce((acc, drop) => {
    // Use createdAt and expiredAt to determine if drop is active
    const createdAt = DateTime.fromISO(drop.createdAt);
    const expiredAt = DateTime.fromISO(drop.expiresAt);
    const now = DateTime.now();
    if (createdAt < now && expiredAt > now) {
      return acc + 1;
    }
    return acc;
  }, 0);
});

type QueryCountResponse = {
  itemCount: {
    totalCount: number;
  };
};

const totalClaims = asyncComputed(async () => {
  if (!drops.value) {
    return 0;
  }
  let claims = 0;
  for (const drop of drops.value) {
    const query = client.value.itemCountByCollectionId(drop.id);
    const { data } = await client.value.fetch<QueryCountResponse>(query);
    claims += data.itemCount.totalCount;
  }
  return claims;
}, 0);
</script>
