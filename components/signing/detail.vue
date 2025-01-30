<template>
  <div class="flex items-center gap-5">
    <div class="flex max-h-20 max-w-20 overflow-hidden rounded-full border-2 border-border-color">
      <img :src="imagePreview" class="flex-1 rounded-full object-cover" />
    </div>
    <div class="flex flex-col gap-2">
      <h1 class="text-xl text-text-color">{{ props.name }}</h1>
      <p class="text-sm text-text-color opacity-70">
        {{
          $t("create.dialog.network", {
            name: chainName,
          })
        }}
      </p>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <p class="text-sm text-text-color">{{ $t("create.dialog.eventStart") }}</p>
    <p class="text-right text-sm text-text-color/70">{{ props.startDate.toISOString().split("T").at(0) }}</p>
    <p class="text-sm text-text-color">{{ $t("create.dialog.eventEnd") }}</p>
    <p class="text-right text-sm text-text-color/70">{{ props.endDate.toISOString().split("T").at(0) }}</p>
    <p class="text-sm text-text-color">{{ $t("create.dialog.code") }}</p>
    <span class="flex items-center justify-end gap-2">
      <p
        class="text-sm font-bold text-text-color/70 transition-all"
        :class="{ '[&:not(:hover)]:blur-sm': !displaySecret }"
      >
        {{ props.secret }}
      </p>

      <Icon
        :name="displaySecret ? 'mdi:eye' : 'mdi:eye-off'"
        class="cursor-pointer text-text-color/70"
        @click="displaySecret = !displaySecret"
      />
    </span>
    <p class="text-sm text-text-color">{{ $t("create.dialog.amount") }}</p>
    <p class="text-right text-sm font-bold text-text-color/70">{{ props.quantity }}</p>
  </div>

  <hr class="-mx-6 my-3" />

  <div class="grid grid-cols-2 gap-3">
    <p class="text-sm text-text-color">{{ $t("create.dialog.total") }}</p>
    <p class="text-right text-sm text-text-color">
      <span class="ml-2 font-bold text-text-color/70"> {{ symbolValue }} {{ properties.symbol }} </span>
      <span v-if="dollarValue === null || priceLoading" class="animate-pulse text-xs text-text-color/50">
        ({{ $t("common.calculating") }})
      </span>
      <span v-else-if="!priceError" class="text-xs text-text-color/50"> ({{ dollarValue.toFixed(2) }}$) </span>
    </p>

    <button class="col-span-2 flex items-center gap-2" @click="showBreakdown = !showBreakdown">
      <p class="text-xs text-text-color opacity-50">{{ $t("create.dialog.breakdown") }}</p>
      <Icon :name="`mdi:chevron-${showBreakdown ? 'up' : 'down'}`" size="20" class="text-text-color opacity-50" />
    </button>

    <template v-if="showBreakdown">
      <p class="text-sm text-text-color">{{ $t("create.dialog.collectionDeposit") }}</p>
      <p class="text-right text-sm text-text-color/70">{{ depositForCollection }} {{ properties.symbol }}</p>
      <p class="text-sm text-text-color">{{ $t("create.dialog.freeMintingDeposit") }}</p>
      <p class="text-right text-sm text-text-color/70">
        {{ props.quantity }} x {{ depositPerItem }} {{ properties.symbol }}
      </p>
      <p class="text-sm text-text-color">{{ $t("create.dialog.fees") }}</p>
      <p class="text-right text-sm text-text-color/70">0.02 {{ properties.symbol }}</p>
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
  secret: string;
  description?: string;
  chain: Prefix;
  symbolValue: number;
  dollarValue: number | null;
  priceLoading: boolean;
  priceError: string | null;
  depositPerItem: number;
  depositForCollection: number;
}>();

const showBreakdown = ref(false);
const displaySecret = ref(false);

// NFT Properties
const properties = computed(() => chainAssetOf(props.chain));
const chainName = getChainName(props.chain);

// Image
const imagePreview = ref("");

onMounted(() => {
  const reader = new FileReader();
  reader.onload = (e) => (imagePreview.value = e.target?.result as string);
  reader.readAsDataURL(props.image);
});
</script>
