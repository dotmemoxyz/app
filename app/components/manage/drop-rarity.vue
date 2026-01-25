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
              <div class="flex flex-1 flex-col gap-3 sm:grid sm:grid-cols-[1.05fr_1.6fr_auto] sm:items-center sm:gap-3">
                <dot-text-input
                  v-model="tier.name"
                  :placeholder="t('manage.rarity.tierName')"
                  :disabled="isLocked"
                  class="w-full"
                />

                <div
                  class="bg-surface-default group relative flex w-full items-center gap-3 rounded-xl border border-dashed border-border-default px-3 py-2 transition-colors hover:border-accent-primary hover:bg-accent-primary/5 dark:hover:bg-accent-primary/10"
                  :class="{ 'cursor-not-allowed opacity-50': isLocked }"
                  role="button"
                  :tabindex="isLocked ? -1 : 0"
                  @click="openFileDialog(index)"
                  @keydown.enter.prevent="openFileDialog(index)"
                  @keydown.space.prevent="openFileDialog(index)"
                  @dragover.prevent
                  @drop.prevent="onTierDrop($event, index)"
                >
                  <input
                    :ref="(el) => setFileInputRef(el, index)"
                    type="file"
                    accept="image/jpeg, image/png, image/gif, image/tiff, image/webp"
                    class="sr-only"
                    :disabled="isLocked"
                    @change="onTierImageChange($event, index)"
                  />

                  <template v-if="tier.image">
                    <div
                      class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border-default bg-surface-card"
                    >
                      <img
                        :src="getTierImageUrl(tier)"
                        :alt="tier.name || 'Tier image'"
                        class="h-full w-full object-cover"
                      />
                      <button
                        v-if="!isLocked"
                        type="button"
                        class="absolute right-1 top-1 flex rounded-full bg-black/60 p-1 text-white transition hover:bg-black"
                        @click.stop="clearTierImage(index)"
                      >
                        <Icon name="mdi:close" class="size-3" />
                      </button>
                    </div>
                    <div class="flex min-w-0 flex-col">
                      <span class="truncate text-sm font-medium text-text-primary">{{ getTierImageName(tier) }}</span>
                      <span class="text-xs text-text-secondary">{{ t("manage.rarity.replaceImage") }}</span>
                    </div>
                  </template>

                  <template v-else>
                    <div class="flex flex-1 items-center gap-3">
                      <div
                        class="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border-default bg-surface-card text-text-secondary"
                      >
                        <Icon name="mdi:tray-arrow-up" class="size-5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-text-primary">{{ t("manage.rarity.uploadImage") }}</span>
                        <span class="text-xs text-text-secondary">{{ t("manage.rarity.dragAndDrop") }}</span>
                      </div>
                    </div>
                  </template>
                </div>

                <div class="flex items-center gap-2 sm:justify-end">
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
      <div v-if="canSave && !drop.tiers && tiersEnabled" class="flex items-center justify-between text-sm">
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
import type { DistributionMode, LocalRarityTier, MemoDetail, RarityTier, TiersData } from "~/types/memo";
import { pinDirectory } from "~/services/nftStorage";
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
const attributeDeposit = ref<bigint | null>(null);
const supplyLoading = ref(true);

const tiers = ref<LocalRarityTier[]>(normalizeTiersData(structuredClone(props.drop.tiers?.tiers ?? DEFAULT_TIERS)));
const fileInputs = ref<HTMLInputElement[]>([]);
const isLocked = computed(() => props.drop.tiersLocked ?? false);
const loading = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);

const initialEnabled = ref(!!props.drop.tiers);
const initialDistributionMode = ref(props.drop.tiers?.distributionMode ?? DEFAULT_DISTRIBUTION_MODE);
const initialTiers = ref(serializeTiers(normalizeTiersData(props.drop.tiers?.tiers ?? DEFAULT_TIERS)));

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
  if (serializeTiers(tiers.value) !== initialTiers.value) return true;
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

  const hasAnyImage = tiers.value.some((t) => t.image || t.imageFile);
  const hasMissingImage = tiers.value.some((t) => !(t.image || t.imageFile));

  if (hasAnyImage && hasMissingImage) {
    return t("manage.rarity.errorMixedImages");
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

const totalCost = computed<bigint>(() => {
  if (!totalSupply.value || !attributeDeposit.value) return 0n;
  return BigInt(totalSupply.value) * attributeDeposit.value;
});

const formattedCost = computed(() => {
  if (!totalCost.value) return "";
  return formatAmount(totalCost.value, props.drop.chain);
});

function normalizeTiersData(data: RarityTier[]): RarityTier[] {
  return data.map((tier) => ({
    ...tier,
    image: tier.image ?? undefined,
  }));
}

function serializeTiers(data: RarityTier[]): string {
  return JSON.stringify(
    data.map(({ name, weight, image }) => ({
      name,
      weight,
      image: image ?? undefined,
    })),
  );
}

function addTier() {
  tiers.value.push({ name: "", weight: 0, image: undefined, imageName: null, imageFile: null });
}

function removeTier(index: number) {
  tiers.value.splice(index, 1);
  fileInputs.value.splice(index, 1);
}

function setFileInputRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLInputElement) {
    fileInputs.value[index] = el;
  }
}

function openFileDialog(index: number) {
  if (isLocked.value) return;
  fileInputs.value[index]?.click();
}

function updateTier(index: number, payload: Partial<LocalRarityTier>) {
  const existing = tiers.value[index];
  if (!existing) return;

  tiers.value.splice(index, 1, { ...existing, ...payload });
}

function updateTierImage(index: number, file: File) {
  if (isLocked.value || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    updateTier(index, {
      image: String(event.target?.result ?? ""),
      imageName: file.name,
      imageFile: file,
    });
  };
  reader.readAsDataURL(file);
}

function onTierImageChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (!file) return;

  updateTierImage(index, file);
}

function onTierDrop(event: DragEvent, index: number) {
  if (isLocked.value) return;

  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  updateTierImage(index, file);
}

function clearTierImage(index: number) {
  updateTier(index, { image: undefined, imageName: null, imageFile: null });

  const input = fileInputs.value[index];
  if (input) {
    input.value = "";
  }
}

function getTierImageName(tier: LocalRarityTier): string {
  if (tier.imageName) return truncateFilename(tier.imageName);
  if (tier.image?.startsWith("data:")) return t("manage.rarity.uploadImage");

  if (tier.image) {
    try {
      const url = new URL(tier.image);
      const last = url.pathname.split("/").filter(Boolean).pop();
      if (last) return truncateFilename(decodeURIComponent(last));
    } catch {
      const last = tier.image.split("/").pop();
      if (last && !last.startsWith("data")) return truncateFilename(last.split("?")[0] as string);
    }
  }

  return tier.image ? "" : t("manage.rarity.noImage");
}

function truncateFilename(name: string, maxLength = 16): string {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf(".");
  const ext = extIndex > -1 ? name.slice(extIndex) : "";
  const base = ext ? name.slice(0, extIndex) : name;
  const keep = Math.max(6, maxLength - ext.length - 3);
  return `${base.slice(0, keep)}...${ext}`;
}

function getTierImageUrl(tier: LocalRarityTier): string {
  if (tier.image?.startsWith("ipfs:")) {
    return sanitizeIpfsUrl(tier.image);
  }

  return tier.image || "";
}

async function uploadTierImages() {
  const filesToUpload = tiers.value
    .map((tier, index) => ({ tier, index }))
    .filter(({ tier }) => tier.imageFile instanceof File);

  if (filesToUpload.length === 0) return;

  try {
    const files = filesToUpload.map(({ tier }) => tier.imageFile!) as File[];
    const cid = await pinDirectory(
      files.length === 1
        ? [...files, ...files] // hack to force path on cid and be able to display the image name
        : files,
    );

    filesToUpload.forEach(({ tier, index }) => {
      const file = tier.imageFile!;
      const imageUrl = `ipfs://${cid}/${encodeURIComponent(file.name)}`;
      updateTier(index, { image: imageUrl, imageName: null, imageFile: null });
    });
  } catch (error) {
    console.error("Failed to upload tier images:", error);
    throw new Error(t("manage.rarity.errorUpload"));
  }
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

  const client = await apiInstanceByPrefix(props.drop.chain);

  const cb = (dest: string, value: bigint) => client.tx.balances.transferKeepAlive(dest, value);
  const arg: [string, bigint] = [MEMO_BOT, totalCost.value];

  initTransactionLoader();

  loading.value = true;
  saveError.value = null;
  saveSuccess.value = false;

  try {
    await uploadTierImages();
  } catch (error) {
    console.error("Failed to upload tier images. Reason: %s", (error as Error).message);
    saveError.value = t("manage.rarity.errorUpload");
    loading.value = false;
    return;
  }

  try {
    // TODO: add drop.tiers.paid
    const paid = props.drop.tiers;
    if (!tiersEnabled.value || paid) {
      await saveTiers();
      return;
    }

    await howAboutToExecute(accountId.value, cb, arg, {
      onResult({ result }) {
        if (result.status.type === "Finalized" && !result.dispatchError) {
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
    initialTiers.value = serializeTiers(normalizeTiersData(DEFAULT_TIERS));
  } else {
    initialDistributionMode.value = distributionMode.value;
    initialTiers.value = serializeTiers(tiers.value);
  }
}

async function saveTiers() {
  try {
    const body = tiersEnabled.value
      ? {
          enabled: true,
          distributionMode: distributionMode.value,
          tiers: tiers.value.map(({ name, weight, image }) => ({
            name,
            weight,
            image,
          })),
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
    tiers.value = normalizeTiersData(structuredClone(DEFAULT_TIERS));
    fileInputs.value = [];
  }
});

onMounted(async () => {
  try {
    const client = await apiInstanceByPrefix(props.drop.chain);
    const result = await getFreeMints(client, Number(props.drop.id));
    totalSupply.value = result.maxTokens;
    attributeDeposit.value = client.consts.nfts.attributeDepositBase;
  } catch (error) {
    console.error("Error fetching collection supply:", error);
    totalSupply.value = null;
    attributeDeposit.value = null;
  } finally {
    supplyLoading.value = false;
  }
});
</script>
