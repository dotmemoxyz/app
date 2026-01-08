<template>
  <div class="flex max-w-6xl flex-col gap-8 px-4 py-8">
    <!-- Section Header -->
    <div class="flex max-w-2xl items-center justify-between">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-medium text-text-primary">{{ t("manage.rarity.title") }}</h2>
          <dot-tooltip :text="t('manage.rarity.hint')" position="top" />
        </div>
        <p class="text-sm text-text-secondary">{{ t("manage.rarity.description") }}</p>
      </div>
      <dot-switch v-model="tiersEnabled" :disabled="isLocked" />
    </div>

    <!-- Locked Warning -->
    <div v-if="isLocked" class="flex max-w-2xl items-center gap-3 rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/30">
      <Icon name="mdi:lock" class="size-5 text-yellow-600 dark:text-yellow-400" />
      <p class="text-sm text-yellow-700 dark:text-yellow-300">
        {{ t("manage.rarity.locked") }}
      </p>
    </div>

    <!-- Section Content -->
    <div v-if="tiersEnabled" class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <!-- Left Column -->
      <div class="flex w-full max-w-2xl flex-col gap-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <dot-segment-control v-model="distributionMode" :options="distributionModeOptions" :disabled="isLocked" />

          <div class="flex items-center gap-2 rounded-lg border border-border-default bg-surface-card px-3 py-1.5">
            <span class="text-sm text-text-secondary">{{ t("manage.rarity.totalSupply") }}:</span>
            <span v-if="supplyLoading" class="text-sm text-text-secondary">Loading...</span>
            <span v-else-if="totalSupply" class="text-sm font-medium text-text-primary">{{
              totalSupply.toLocaleString()
            }}</span>
            <span v-else class="text-sm text-text-secondary">Unknown</span>
          </div>
        </div>

        <!-- Tiers List -->
        <div class="flex flex-col gap-4">
          <div
            class="divide-y divide-border-default overflow-hidden rounded-xl border border-border-default bg-surface-card"
          >
            <div
              v-for="(tier, index) in tiers"
              :key="index"
              class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <dot-text-input
                  v-model="tier.name"
                  :placeholder="t('manage.rarity.tierName')"
                  :disabled="isLocked"
                  class="flex-1"
                />

                <div class="flex items-center gap-2">
                  <dot-text-input
                    v-model.number="tier.weight"
                    type="number"
                    :placeholder="distributionMode === 'percentage' ? '0-100' : 'Qty'"
                    :disabled="isLocked"
                    class="w-24"
                    :min="0"
                    :max="distributionMode === 'percentage' ? 100 : undefined"
                  />
                  <span v-if="distributionMode === 'percentage'" class="w-8 text-sm font-medium text-text-secondary">
                    %
                  </span>
                </div>
              </div>

              <button
                v-if="!isLocked && tiers.length > 1"
                type="button"
                :title="t('common.remove')"
                class="self-end p-1 text-text-secondary opacity-50 transition-opacity hover:text-red-500 hover:opacity-100 sm:self-center sm:opacity-100"
                @click="removeTier(index)"
              >
                <Icon name="mdi:close" class="size-5" />
              </button>
            </div>
          </div>

          <!-- Add Tier Button -->
          <button
            v-if="!isLocked && tiers.length < MAX_TIERS"
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-default py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent-primary hover:bg-accent-primary/5 hover:text-accent-primary dark:hover:bg-accent-primary/10"
            @click="addTier"
          >
            <Icon name="mdi:plus" class="size-5" />
            <span>{{ t("manage.rarity.addTier") }}</span>
          </button>

          <!-- Validation Error -->
          <div
            v-if="validationError"
            class="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            <Icon name="mdi:alert-circle" class="size-5 flex-shrink-0" />
            <span class="font-medium">{{ validationError }}</span>
          </div>
        </div>
      </div>

      <!-- Right Column  -->
      <aside class="flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-[320px] lg:flex-shrink-0">
        <div class="flex flex-col gap-4 rounded-xl border border-border-default bg-surface-card p-5 shadow-sm">
          <h4 class="font-medium text-text-primary">{{ t("manage.rarity.preview") }}</h4>

          <!-- Empty State -->
          <div v-if="tiers.length === 0" class="py-8 text-center text-sm text-text-secondary">
            {{ t("manage.rarity.noTiers") }}
          </div>

          <!-- Visual Bar Chart -->
          <div v-else class="flex flex-col gap-4">
            <div class="flex h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                v-for="(tier, index) in tiers"
                :key="index"
                class="h-full transition-all duration-500"
                :class="getBarColor(index)"
                :style="{ width: `${getPercentage(tier.weight)}%` }"
                :title="`${tier.name}: ${getPercentage(tier.weight).toFixed(1)}%`"
              />
            </div>

            <div class="flex flex-col gap-2">
              <div v-for="(tier, index) in tiers" :key="index" class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2 overflow-hidden">
                  <div class="size-3 flex-shrink-0 rounded-full" :class="getBarColor(index)" />
                  <span class="truncate font-medium text-text-secondary" :title="tier.name">{{
                    tier.name || `Tier ${index + 1}`
                  }}</span>
                </div>

                <!-- Details -->
                <div class="flex flex-col items-end text-xs sm:flex-row sm:gap-2">
                  <span v-if="totalSupply" class="text-text-secondary">
                    <template v-if="distributionMode === 'percentage'">
                      ~{{ Math.floor((tier.weight / 100) * totalSupply).toLocaleString() }}
                    </template>
                    <template v-else>
                      {{ tier.weight.toLocaleString() }}
                    </template>
                  </span>
                  <span class="font-mono font-medium text-text-primary">
                    {{ getPercentage(tier.weight).toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-2 border-t border-border-default pt-3">
              <div class="flex justify-between text-sm">
                <span class="text-text-secondary">{{ t("manage.rarity.totalAllocated") }}</span>
                <span class="font-bold" :class="totalWeightClass"> {{ getPercentage(totalWeight).toFixed(1) }}% </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="!isLocked" class="flex max-w-2xl flex-col gap-2">
      <div v-if="canSave && tiersEnabled" class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-1.5 text-text-secondary">
          <span>{{ t("manage.rarity.cost") }}</span>
          <dot-tooltip :text="t('manage.rarity.costHint')" position="top" width="w-56">
            <template #trigger>
              <Icon name="mdi:help-circle-outline" class="size-4 text-text-secondary" />
            </template>
          </dot-tooltip>
        </div>
        <div>
          <dot-skeleton v-if="supplyLoading" class="h-4 w-16" roundness="sm" />
          <span v-else-if="totalCost > 0" class="font-medium text-text-primary">~{{ formattedCost }}</span>
          <span v-else class="text-text-secondary">--</span>
        </div>
      </div>

      <dot-button
        :disabled="!canSave || loading"
        size="large"
        variant="tertiary"
        class="w-full"
        @click="signAndSaveTiers"
      >
        {{ loading ? t("common.saving") : t("common.saveChanges") }}
      </dot-button>

      <div v-if="saveError || saveSuccess" class="flex flex-col gap-1">
        <small v-if="saveError" class="text-center text-red-500">{{ saveError }}</small>
        <small v-if="saveSuccess" class="text-center text-green-500">{{ t("manage.rarity.saved") }}</small>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DistributionMode, MemoDetail, RarityTier, TiersData } from "~/types/memo";
import { MEMO_BOT } from "~/utils/sdk/constants";
import { getFreeMints } from "~/utils/sdk/query";

const { t } = useI18n();

const props = defineProps<{
  drop: MemoDetail;
}>();

const MAX_TIERS = 10;
const SUCCESS_MESSAGE_TIMEOUT = 3000;
const BAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

const DEFAULT_TIERS: RarityTier[] = [
  { name: "Common", weight: 70 },
  { name: "Uncommon", weight: 20 },
  { name: "Rare", weight: 8 },
  { name: "Legendary", weight: 2 },
];

const DEFAULT_DISTRIBUTION_MODE = "percentage";

const { apiInstanceByPrefix } = useApi(ref(props.drop.chain));
const { accountId } = useAuth();

const { howAboutToExecute, initTransactionLoader, status } = useMetaTransaction(computed(() => props.drop.chain));

const tiersEnabled = ref(!!props.drop.tiers);
const distributionMode = ref<DistributionMode>(props.drop.tiers?.distributionMode ?? DEFAULT_DISTRIBUTION_MODE);
const distributionModeOptions = computed(() => [
  { value: "percentage", label: t("manage.rarity.percentage") },
  { value: "fixed", label: t("manage.rarity.absolute") },
]);
const totalSupply = ref<number | null>(null);
const attributeDeposit = ref<number | null>(null);
const supplyLoading = ref(true);

const tiers = ref<RarityTier[]>(structuredClone(props.drop.tiers?.tiers ?? DEFAULT_TIERS));
const isLocked = computed(() => props.drop.tiersLocked ?? false);
const loading = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);

const initialEnabled = ref(!!props.drop.tiers);
const initialDistributionMode = ref(props.drop.tiers?.distributionMode ?? DEFAULT_DISTRIBUTION_MODE);
const initialTiers = ref(JSON.stringify(props.drop.tiers?.tiers ?? DEFAULT_TIERS));

const totalWeight = computed(() => {
  return tiers.value.reduce((sum, tier) => sum + (tier.weight || 0), 0);
});

const totalWeightClass = computed(() => {
  if (distributionMode.value === "percentage") {
    return totalWeight.value === 100 ? "text-green-500" : "text-red-500";
  } else {
    if (totalSupply.value === null) return "text-text-secondary";
    return totalWeight.value === totalSupply.value ? "text-green-500" : "text-red-500";
  }
});

const isDirty = computed(() => {
  if (tiersEnabled.value !== initialEnabled.value) return true;
  if (distributionMode.value !== initialDistributionMode.value) return true;
  if (JSON.stringify(tiers.value) !== initialTiers.value) return true;
  return false;
});

const validationError = computed(() => {
  if (!tiersEnabled.value) return null;

  const names = tiers.value.map((t) => t.name.toLowerCase()).filter((n) => n);

  if (new Set(names).size !== names.length) {
    return t("manage.rarity.errorDuplicate");
  }

  if (tiers.value.some((t) => !t.name.trim())) {
    return t("manage.rarity.errorEmptyName");
  }

  if (distributionMode.value === "percentage") {
    if (totalWeight.value !== 100) {
      return t("manage.rarity.errorSum");
    }
    if (tiers.value.some((t) => t.weight < 1 || t.weight > 100)) {
      return t("manage.rarity.errorWeight");
    }
  } else {
    if (totalSupply.value !== null && totalWeight.value !== totalSupply.value) {
      return t("manage.rarity.errorSumFixed", { total: totalSupply.value?.toLocaleString() ?? "N/A" });
    }
    if (tiers.value.some((t) => t.weight < 1)) {
      return t("manage.rarity.errorQuantity");
    }
  }

  return null;
});

const canSave = computed(() => {
  if (!isDirty.value) return false;
  if (!tiersEnabled.value) return true;
  if (!totalSupply.value || !attributeDeposit.value) return false;
  return validationError.value === null && tiers.value.length > 0;
});

const totalCost = computed(() => {
  if (!totalSupply.value || !attributeDeposit.value) return 0;
  return totalSupply.value * attributeDeposit.value;
});

const formattedCost = computed(() => {
  if (!totalCost.value) return "";
  return formatAmount(totalCost.value, props.drop.chain);
});

function addTier() {
  tiers.value.push({ name: "", weight: 0 });
}

function removeTier(index: number) {
  tiers.value.splice(index, 1);
}

function getBarColor(index: number): string {
  return BAR_COLORS[index % BAR_COLORS.length] ?? "bg-gray-500";
}

function getPercentage(weight: number): number {
  if (distributionMode.value === "percentage") {
    return weight;
  }
  // Fixed mode: calculate percentage from total supply
  if (!totalSupply.value || totalSupply.value <= 0) return 0;
  return (weight / totalSupply.value) * 100;
}

async function signAndSaveTiers() {
  if (!canSave.value || isLocked.value || !totalSupply.value || !attributeDeposit.value || !accountId.value) return;

  const api = await apiInstanceByPrefix(props.drop.chain);

  const cb = api.tx.balances.transferKeepAlive;
  const arg = [MEMO_BOT, totalCost.value];

  initTransactionLoader();

  loading.value = true;
  saveError.value = null;
  saveSuccess.value = false;

  try {
    // TODO: add drop.tiers.paid
    const paid = props.drop.tiers;
    if (!tiersEnabled.value || paid) {
      await saveTiers();
      return;
    }

    await howAboutToExecute(accountId.value, cb, arg, {
      onResult({ result }) {
        if (result.isCompleted && !result.dispatchError) {
          saveTiers();
        }
      },
      onError(error) {
        throw error;
      },
    });
  } catch (e) {
    console.error("Failed to execute transaction. Reason: %s", (e as Error).message);
    saveError.value = t("manage.rarity.transactionError");
    loading.value = false;
  }
}

watch(status, (status) => {
  if (status === TransactionStatus.Cancelled) {
    loading.value = false;
  }
});

function showSuccessMessage() {
  saveSuccess.value = true;

  setTimeout(() => {
    saveSuccess.value = false;
  }, SUCCESS_MESSAGE_TIMEOUT);
}

function resetDirty() {
  initialEnabled.value = tiersEnabled.value;

  if (!tiersEnabled.value) {
    initialDistributionMode.value = DEFAULT_DISTRIBUTION_MODE;
    initialTiers.value = JSON.stringify(DEFAULT_TIERS);
  } else {
    initialDistributionMode.value = distributionMode.value;
    initialTiers.value = JSON.stringify(tiers.value);
  }
}

async function saveTiers() {
  try {
    const body = tiersEnabled.value
      ? {
          enabled: true,
          distributionMode: distributionMode.value,
          tiers: tiers.value,
        }
      : { enabled: false };

    await $fetch<{ tiers: TiersData }>(`/api/manage/created/${props.drop.chain}/${props.drop.id}/tiers`, {
      method: "PUT",
      body,
    });

    showSuccessMessage();
    resetDirty();
  } catch (error: any) {
    console.error("Error saving tiers:", error);
    saveError.value = error.data?.message || error.message || "Failed to save tiers";
  } finally {
    loading.value = false;
  }
}

watch(tiersEnabled, (enabled) => {
  if (enabled) {
    distributionMode.value = DEFAULT_DISTRIBUTION_MODE;
    tiers.value = structuredClone(DEFAULT_TIERS);
  }
});

onMounted(async () => {
  try {
    const api = await apiInstanceByPrefix(props.drop.chain);
    const result = await getFreeMints(api, props.drop.id);
    totalSupply.value = result.maxTokens;
    attributeDeposit.value = api.consts.nfts.attributeDepositBase.toNumber();
  } catch (error) {
    console.error("Error fetching collection supply:", error);
    totalSupply.value = null;
    attributeDeposit.value = null;
  } finally {
    supplyLoading.value = false;
  }
});
</script>
