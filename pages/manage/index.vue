<template>
  <div class="flex h-full w-full flex-col gap-8 px-8 py-10">
    <h1 class="text-[40px] !text-black dark:!text-white">{{ $t("manage.title") }}</h1>
    <div class="flex w-full justify-between">
      <!-- Statistics -->
      <div class="flex gap-4">
        <!-- Active drops -->
        <div class="flex items-center gap-2">
          <div class="flex size-16 items-center justify-center rounded-full bg-[#94FFBB] p-2">
            <Icon name="memo:bar-chart" class="size-[34px] text-[#00AD40]" />
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-[14px] !text-black/40 dark:!text-white/70">{{ $t("manage.activeDrops") }}</p>
            <p class="text-[20px] text-black">3</p>
          </div>
        </div>
        <!-- Total claims -->
        <div class="flex items-center gap-2">
          <div class="flex size-16 items-center justify-center rounded-full bg-[#ABD9FE] p-2">
            <Icon name="memo:people" class="size-[34px] text-[#007BDF]" />
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-[14px] !text-black/40 dark:!text-white/70">{{ $t("manage.totalClaims") }}</p>
            <p class="text-[20px] text-black">14 000</p>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <!-- Chain select -->
        <dot-select v-model="urlParams.chain" class="w-[250px]" :options="chainList" />
        <dot-button variant="tertiary" squared @click="navigateTo('/create')">
          {{ $t("manage.createDrop") }}
        </dot-button>
      </div>
    </div>
    <div class="grid w-full grid-cols-4 gap-4">
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
</script>

<style></style>
