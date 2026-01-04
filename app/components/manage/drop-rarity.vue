<template>
  <div class="flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-8">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-medium">{{ t("manage.rarity.title") }}</h2>
        <div
          class="group relative flex h-[20px] w-[20px] cursor-default items-center justify-center rounded-full border-2 border-text-secondary px-2"
        >
          <span class="text-[12px] text-text-secondary">?</span>
          <span
            class="pointer-events-none absolute bottom-5 right-0 z-50 mt-2 w-64 rounded-lg border border-border-default bg-white px-3 py-2 text-sm text-gray-800 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-100"
          >
            {{ t("manage.rarity.hint") }}
          </span>
        </div>
      </div>
      <p class="text-sm text-text-secondary">{{ t("manage.rarity.description") }}</p>
    </div>

    <!-- Locked Warning -->
    <div v-if="isLocked" class="flex max-w-2xl items-center gap-3 rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/30">
      <Icon name="mdi:lock" class="size-5 text-yellow-600 dark:text-yellow-400" />
      <p class="text-sm text-yellow-700 dark:text-yellow-300">
        {{ t("manage.rarity.locked") }}
      </p>
    </div>

    <!-- Configuration Card -->
    <div class="flex max-w-2xl flex-col rounded-lg border border-border-default bg-surface-card">
      <!-- Enable Toggle Row -->
      <div class="flex items-center justify-between p-4">
        <span class="font-medium">{{ t("manage.rarity.enable") }}</span>
        <dot-switch v-model="tiersEnabled" :disabled="isLocked" />
      </div>

      <!-- Distribution Mode & Total Supply Row -->
      <div
        v-if="tiersEnabled"
        class="flex flex-wrap items-center justify-between gap-4 border-t border-border-default p-4"
      >
        <!-- Distribution Mode Toggle -->
        <div class="flex overflow-hidden rounded-lg border border-border-default">
          <button
            type="button"
            :disabled="isLocked"
            :class="[
              'px-3 py-1.5 text-sm transition-colors',
              distributionMode === 'percentage'
                ? 'bg-accent-primary text-white'
                : 'bg-surface-card hover:bg-gray-100 dark:hover:bg-gray-700',
              isLocked && 'cursor-not-allowed opacity-50',
            ]"
            @click="distributionMode = 'percentage'"
          >
            Percentage
          </button>
          <button
            type="button"
            :disabled="isLocked"
            :class="[
              'px-3 py-1.5 text-sm transition-colors',
              distributionMode === 'fixed'
                ? 'bg-accent-primary text-white'
                : 'bg-surface-card hover:bg-gray-100 dark:hover:bg-gray-700',
              isLocked && 'cursor-not-allowed opacity-50',
            ]"
            @click="distributionMode = 'fixed'"
          >
            Absolute
          </button>
        </div>

        <!-- Total Supply (read-only) -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-text-secondary">{{ t("manage.rarity.totalSupply") }}:</span>
          <span v-if="supplyLoading" class="text-sm text-text-secondary">Loading...</span>
          <span v-else-if="totalSupply" class="font-medium">{{ totalSupply.toLocaleString() }}</span>
          <span v-else class="text-sm text-text-secondary">Unknown</span>
        </div>
      </div>
    </div>

    <div v-if="tiersEnabled" class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <!-- Tier Configuration -->
      <div class="flex w-full max-w-2xl flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="font-medium">{{ t("manage.rarity.tiers") }}</h3>
          <span class="text-sm" :class="totalWeightClass">
            <template v-if="distributionMode === 'percentage'">
              {{ t("manage.rarity.total") }}: {{ totalWeight }}%
            </template>
            <template v-else-if="totalSupply">
              {{ totalWeight.toLocaleString() }} / {{ totalSupply.toLocaleString() }} {{ t("manage.rarity.allocated") }}
            </template>
            <template v-else> {{ totalWeight.toLocaleString() }} {{ t("manage.rarity.allocated") }} </template>
          </span>
        </div>

        <!-- Tier Items -->
        <div class="flex flex-col gap-3">
          <div
            v-for="(tier, index) in tiers"
            :key="index"
            class="flex items-center gap-3 rounded-lg border border-border-default bg-surface-card p-3"
          >
            <dot-text-input
              v-model="tier.name"
              :placeholder="t('manage.rarity.tierName')"
              :disabled="isLocked"
              class="flex-1"
            />
            <div class="flex items-center gap-1">
              <dot-text-input
                v-model.number="tier.weight"
                type="number"
                :placeholder="
                  distributionMode === 'percentage' ? t('manage.rarity.weight') : t('manage.rarity.quantity')
                "
                :disabled="isLocked"
                class="w-20"
                :min="0"
                :max="distributionMode === 'percentage' ? 100 : undefined"
              />
              <span class="w-10 text-center text-sm text-text-secondary">{{
                distributionMode === "percentage" ? "%" : "Qty"
              }}</span>
            </div>
            <button
              v-if="!isLocked && tiers.length > 1"
              type="button"
              class="size-7 flex-shrink-0 rounded-full p-1 text-text-secondary transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
              @click="removeTier(index)"
            >
              <Icon name="mdi:close" class="size-5" />
            </button>
          </div>
        </div>

        <!-- Add Tier Button -->
        <button
          v-if="!isLocked && tiers.length < 10"
          type="button"
          class="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-default p-3 text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-primary"
          @click="addTier"
        >
          <Icon name="mdi:plus" class="size-5" />
          <span>{{ t("manage.rarity.addTier") }}</span>
        </button>

        <!-- Validation Message -->
        <div v-if="validationError" class="flex items-center gap-2 text-sm text-red-500">
          <Icon name="mdi:alert-circle" class="size-4" />
          <span>{{ validationError }}</span>
        </div>
      </div>

      <!-- Distribution Preview -->
      <div v-if="tiers.length > 0" class="lg:sticky lg:top-24 lg:h-fit lg:w-[300px] lg:flex-shrink-0">
        <div class="flex flex-col gap-3 rounded-lg border border-border-default bg-surface-card p-4">
          <h4 class="text-sm font-medium text-text-secondary">{{ t("manage.rarity.preview") }}</h4>
          <div class="flex flex-col gap-2">
            <div v-for="(tier, index) in tiers" :key="index" class="flex items-center gap-3">
              <span class="w-24 truncate text-sm">{{ tier.name || `Tier ${index + 1}` }}</span>
              <div class="h-3 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="getBarColor(index)"
                  :style="{ width: `${getPercentage(tier.weight)}%` }"
                />
              </div>
              <span class="w-20 text-right text-sm text-text-secondary">
                <template v-if="distributionMode === 'fixed'">
                  {{ tier.weight.toLocaleString() }} ({{ getPercentage(tier.weight).toFixed(0) }}%)
                </template>
                <template v-else> {{ tier.weight }}% </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLocked" class="flex max-w-2xl flex-col gap-2">
      <!-- Estimated Cost -->
      <div v-if="canSave && tiersEnabled" class="flex items-center justify-between gap-2 py-1">
        <span class="text-sm text-text-secondary">{{ t("manage.rarity.cost") }}</span>
        <dot-skeleton v-if="supplyLoading" class="h-5 w-24" roundness="sm" />
        <div v-else-if="totalCost > 0" class="group relative flex items-center gap-1">
          <span class="text-sm font-semibold">~{{ formattedCost }}</span>
          <Icon name="mdi:information-outline" class="size-4 cursor-help text-text-secondary" />
          <span
            class="pointer-events-none absolute bottom-6 right-0 z-50 w-56 rounded-lg border border-border-default bg-white px-3 py-2 text-xs text-gray-800 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-100"
          >
            {{ t("manage.rarity.costHint") }}
          </span>
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
      <small v-if="saveError" class="text-center text-red-500">{{ saveError }}</small>
      <small v-if="saveSuccess" class="text-center text-green-500">{{ t("manage.rarity.saved") }}</small>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DistributionMode, Memo, RarityTier, TiersData } from "~/types/memo";
import { MEMO_BOT } from "~/utils/sdk/constants";
import { getFreeMints } from "~/utils/sdk/query";

const { t } = useI18n();

const props = defineProps<{
  drop: Memo;
}>();

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
const totalSupply = ref<number | null>(null);
const attributeDeposit = ref<number | null>(null);
const supplyLoading = ref(true);

const tiers = ref<RarityTier[]>(props.drop.tiers?.tiers?.length ? [...props.drop.tiers.tiers] : [...DEFAULT_TIERS]);
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
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-pink-500",
  ];
  return colors[index % colors.length] || "";
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
      return saveTiers();
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
    saveError.value = "Failed to execute transaction. Try again later or contact support.";
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
  }, 3000);
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
