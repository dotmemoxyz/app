<template>
  <div class="flex items-center gap-5">
    <div class="border-border-color flex max-h-20 max-w-20 overflow-hidden rounded-full border-2">
      <img :src="imagePreview" class="flex-1 rounded-full object-cover" />
    </div>
    <div class="flex flex-col gap-2">
      <h1 class="text-xl text-text-primary">{{ props.name }}</h1>
      <p class="text-sm text-text-primary opacity-70">
        {{
          $t("create.dialog.network", {
            name: chainName,
          })
        }}
      </p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <p class="text-sm text-text-primary">{{ $t("create.dialog.eventStart") }}</p>
    <p class="text-right text-sm text-text-primary/70">{{ props.startDate.toISOString().split("T").at(0) }}</p>
    <p class="text-sm text-text-primary">{{ $t("create.dialog.eventEnd") }}</p>
    <p class="text-right text-sm text-text-primary/70">{{ props.endDate.toISOString().split("T").at(0) }}</p>
    <template v-if="!isDynamic">
      <p class="text-sm text-text-primary">{{ $t("create.dialog.code") }}</p>
      <span class="flex items-center justify-end gap-2">
        <p
          class="text-sm font-bold text-text-primary/70 transition-all"
          :class="{ '[&:not(:hover)]:blur-sm': !displaySecret }"
        >
          {{ props.secret || "-" }}
        </p>

        <Icon
          :name="displaySecret ? 'mdi:eye' : 'mdi:eye-off'"
          class="cursor-pointer text-text-primary/70"
          @click="displaySecret = !displaySecret"
        />
      </span>
    </template>
    <p class="text-sm text-text-primary">{{ $t("create.dialog.amount") }}</p>
    <p class="text-right text-sm font-bold text-text-primary/70">{{ props.quantity }}</p>
  </div>

  <hr class="-mx-6 my-3" />

  <div class="grid grid-cols-2 gap-3">
    <p class="text-sm text-text-primary">{{ $t("create.dialog.total") }}</p>
    <p class="text-right text-sm text-text-primary">
      <span class="ml-2 font-bold text-text-primary/70"> {{ formattedTotalDeposit }} {{ properties.symbol }} </span>
      <span v-if="totalDepositUsd === null || priceLoading" class="animate-pulse text-xs text-text-primary/50">
        ({{ $t("common.calculating") }})
      </span>
      <span v-else-if="!priceError" class="text-xs text-text-primary/50"> ({{ totalDepositUsd.toFixed(2) }}$) </span>
    </p>

    <button class="col-span-2 flex items-center gap-2" @click="showBreakdown = !showBreakdown">
      <p class="text-xs text-text-primary opacity-50">{{ $t("create.dialog.breakdown") }}</p>
      <Icon :name="`mdi:chevron-${showBreakdown ? 'up' : 'down'}`" size="20" class="text-text-primary opacity-50" />
    </button>

    <template v-if="showBreakdown">
      <p class="text-sm text-text-primary">{{ $t("create.dialog.collectionDeposit") }}</p>
      <p class="text-right text-sm text-text-primary/70">{{ formattedDepositForCollection }} {{ properties.symbol }}</p>
      <p class="text-sm text-text-primary">{{ $t("create.dialog.freeMintingDeposit") }}</p>
      <p class="text-right text-sm text-text-primary/70">
        {{ props.quantity }} x {{ formattedDepositPerItem }} {{ properties.symbol }}
      </p>
      <p class="text-sm text-text-primary">{{ $t("create.dialog.fees") }}</p>
      <p class="text-right text-sm text-text-primary/70">0.02 {{ properties.symbol }}</p>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";

const props = defineProps<{
  name: string;
  image: File;
  startDate: Date;
  endDate: Date;
  quantity: number;
  secret?: string;
  securityMode?: SecurityMode;
  description?: string;
  chain: Prefix;
  priceLoading: boolean;
  priceError: string | null;
  totalDeposit: bigint;
  totalDepositUsd: number | null;
  depositPerItem: bigint;
  depositForCollection: bigint;
}>();

const showBreakdown = ref(false);
const displaySecret = ref(false);
const isDynamic = computed(() => props.securityMode === "dynamic");

// NFT Properties
const properties = computed(() => chainAssetOf(props.chain));
const chainName = getChainName(props.chain);

// Image
const imagePreview = ref("");

const formattedTotalDeposit = computed(() => formatAmount(props.totalDeposit, props.chain, { withSymbol: false }));
const formattedDepositPerItem = computed(() => formatAmount(props.depositPerItem, props.chain, { withSymbol: false }));
const formattedDepositForCollection = computed(() =>
  formatAmount(props.depositForCollection, props.chain, { withSymbol: false }),
);

onMounted(() => {
  const reader = new FileReader();
  reader.onload = (e) => (imagePreview.value = e.target?.result as string);
  reader.readAsDataURL(props.image);
});
</script>
