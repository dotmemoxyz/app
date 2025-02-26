<template>
  <div class="flex h-full w-full flex-col gap-8 px-8 py-10">
    <h1 class="text-center text-[40px] !text-black md:text-left dark:!text-white">{{ $t("manage.title") }}</h1>
    <div class="flex w-full flex-wrap justify-between gap-8">
      <!-- Statistics -->
      <div class="flex w-full justify-evenly gap-4 md:w-auto">
        <!-- Active drops -->
        <div class="flex flex-col items-center gap-2 md:flex-row">
          <div class="flex aspect-square size-16 items-center justify-center rounded-full bg-accent-primary-light p-2">
            <Icon name="memo:bar-chart" class="size-[34px] text-accent-primary-dark" />
          </div>
          <div class="flex flex-col items-center gap-2 md:items-start">
            <p class="text-[14px] !text-black/40 dark:!text-white/70">{{ $t("manage.activeDrops") }}</p>
            <p class="text-[20px] text-black">{{ totalActiveDrops }}</p>
          </div>
        </div>
        <!-- Total claims -->
        <div class="flex flex-col items-center gap-2 md:flex-row">
          <div class="flex aspect-square size-16 items-center justify-center rounded-full bg-surface-blue p-2">
            <Icon name="memo:people" class="size-[34px] text-text-blue" />
          </div>
          <div class="flex flex-col items-center gap-2 md:items-start">
            <p class="text-[14px] !text-black/40 dark:!text-white/70">{{ $t("manage.totalClaims") }}</p>
            <p class="text-[20px] text-black">14 000</p>
          </div>
        </div>
      </div>
      <div class="flex w-full justify-center gap-2 md:w-auto">
        <!-- Chain select -->
        <dot-select v-model="urlParams.chain" class="w-[250px]" :options="chainList" />
        <dot-button variant="tertiary" squared @click="navigateTo('/create')">
          <span class="hidden md:block">{{ $t("manage.createDrop") }}</span>
          <Icon name="mdi:plus" size="24" class="md:hidden" />
        </dot-button>
      </div>
    </div>
    <div class="flex w-full flex-wrap justify-center gap-[40px]">
      <template v-if="drops">
        <manage-drop-card v-for="drop in drops" :key="drop.id" :drop="drop" />
      </template>
      <p v-else-if="dropsError">{{ dropsError }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getClient, type Prefix } from "@kodadot1/uniquery";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import type { Memo, UniqCollection } from "~/types/memo";
import { $purify as purify } from "@kodadot1/minipfs";
import type { Option } from "~/types/components";
import { useUrlSearchParams } from "@vueuse/core";
import { DateTime } from "luxon";

const accountStore = useAccountStore();

const urlParams = useUrlSearchParams<{
  chain: Prefix;
}>("history", {
  initialValue: {
    chain: "ahp",
  },
});

const selectedAccount = computed(() => accountStore.selected);

type QueryResponse = {
  collections: UniqCollection[];
};

const chainList = computed<Option[]>(() => [
  { text: "Asset Hub Polkadot", value: "ahp", info: "Polkadot is a multi-chain network." },
  { text: "Asset Hub Kusama", value: "ahk", info: "Kusama is a canary network for Polkadot." },
]);

const { data: drops, error: dropsError } = useAsyncData(
  "drops",
  async () => {
    if (!accountStore.selected) {
      throw new Error("No account selected");
    }
    const client = getClient(urlParams.chain);
    const address = encodeAddress(decodeAddress(selectedAccount.value?.address), urlParams.chain === "ahp" ? 0 : 2);
    const query = client.collectionListByOwner(address);
    const resp = await client.fetch<QueryResponse>(query);
    const memos: Memo[] = [];
    for (const collection of resp.data.collections) {
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
    }
    return memos;
  },
  {
    watch: [urlParams, selectedAccount],
    immediate: true,
  },
);

const totalActiveDrops = computed(() => {
  if (!drops.value) {
    return 0;
  }
  return drops.value.reduce((acc, drop) => {
    // Use createdAt and expiredAt to determine if drop is active
    const createdAt = DateTime.fromSQL(drop.createdAt);
    const expiredAt = DateTime.fromSQL(drop.expiresAt);
    const now = DateTime.now();
    if (createdAt < now && expiredAt > now) {
      return acc + 1;
    }
    return acc;
  }, 0);
});
</script>
