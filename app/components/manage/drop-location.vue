<template>
  <div class="flex max-w-md flex-col gap-6 px-4 pb-10 pt-8">
    <!-- Section Header -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-medium text-text-primary">{{ t("manage.location.title") }}</h2>
        <dot-tooltip :text="t('manage.location.hint')" position="top" />
      </div>
      <p class="text-sm text-text-secondary">{{ t("manage.location.description") }}</p>
    </div>

    <!-- Country Selector -->
    <div v-if="!selectedCountryData" class="flex flex-col gap-2">
      <label class="text-sm font-medium text-text-primary">{{ t("manage.location.country") }}</label>
      <ClientOnly>
        <VueSelect
          v-model="selectedCountry"
          :options="countryOptions"
          :is-searchable="true"
          :is-clearable="false"
          :placeholder="t('manage.location.searchPlaceholder')"
          :classes="{
            control: 'border h-[45px] !rounded-[12px] border-border-default gap-x-[12px] px-[19px] bg-surface-white',
          }"
        />
      </ClientOnly>
    </div>

    <!-- Global Access Hint -->
    <div v-if="!selectedCountryData" class="flex items-center gap-3 rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/30">
      <Icon name="mdi:alert-circle" class="size-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
      <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ t("manage.location.globalAccessHint") }}</p>
    </div>

    <!-- Selected Country -->
    <div
      v-if="selectedCountryData"
      class="flex items-center justify-between rounded-xl border border-border-default bg-surface-card p-4"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ selectedCountryData.flag }}</span>
        <span class="font-medium text-text-primary">{{ selectedCountryData.name }}</span>
      </div>
      <button type="button" class="text-sm text-text-secondary hover:text-red-500" @click="clearSelection">
        {{ t("manage.location.clear") }}
      </button>
    </div>

    <!-- Location Restriction Hint -->
    <div v-if="selectedCountryData" class="flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
      <Icon name="mdi:information" class="size-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
      <p class="text-sm text-blue-700 dark:text-blue-300">
        {{ t("manage.location.restrictedTo", { country: selectedCountryData.name }) }}
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <dot-button :disabled="!canSave || loading" size="large" variant="tertiary" class="w-full" @click="saveLocation">
        {{ loading ? t("common.saving") : t("common.saveChanges") }}
      </dot-button>

      <div v-if="saveError || saveSuccess" class="flex flex-col gap-1">
        <small v-if="saveError" class="text-center text-red-500">{{ saveError }}</small>
        <small v-if="saveSuccess" class="text-center text-green-500">{{ t("manage.location.saved") }}</small>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import VueSelect from "vue3-select-component";
import type { MemoDetail } from "~/types/memo";
import { COUNTRIES, getCountryByCode, type Country } from "~/utils/countries";

const props = defineProps<{
  drop: MemoDetail;
}>();

const emit = defineEmits<{
  (e: "saved"): void;
}>();

const { t } = useI18n();

const SUCCESS_MESSAGE_TIMEOUT = 3000;

const selectedCountry = ref<string | null>(props.drop.locationCountry ?? null);
const loading = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);

const initialCountry = ref(props.drop.locationCountry ?? null);

const countryOptions = computed(() =>
  COUNTRIES.map((country) => ({
    value: country.code,
    label: getCountryDisplay(country.code),
  })),
);

const selectedCountryData = computed<Country | undefined>(() => {
  if (!selectedCountry.value) return undefined;
  return getCountryByCode(selectedCountry.value);
});

const isDirty = computed(() => {
  return selectedCountry.value !== initialCountry.value;
});

const canSave = computed(() => {
  return isDirty.value;
});

function clearSelection() {
  selectedCountry.value = null;
}

async function saveLocation() {
  if (!canSave.value) return;

  loading.value = true;
  saveError.value = null;
  saveSuccess.value = false;

  try {
    await $fetch(`/api/drop/${props.drop.chain}/${props.drop.id}/location`, {
      method: "PUT",
      body: { country: selectedCountry.value },
    });

    initialCountry.value = selectedCountry.value;

    emit("saved");

    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, SUCCESS_MESSAGE_TIMEOUT);
  } catch (error: any) {
    console.error("Error saving location:", error);
    saveError.value = error.data?.message || error.message || "Failed to save location restriction";
  } finally {
    loading.value = false;
  }
}
</script>
