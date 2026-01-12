<template>
  <div class="flex max-w-md flex-col space-y-6 px-4 pb-10 pt-8">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-medium text-text-primary">{{ t("manage.organizers.title") }}</h2>
      <p class="text-sm text-text-secondary">{{ t("manage.organizers.description") }}</p>
    </div>

    <!-- Add organizer form -->
    <div class="flex gap-3">
      <dot-text-input
        v-model="newAddress"
        :placeholder="t('manage.organizers.placeholder')"
        :error="inputError"
        :disabled="isAdding"
        class="flex-1"
        @keydown.enter="addOrganizer"
      />
      <dot-button :disabled="!newAddress.trim() || !!inputError || isAdding" variant="tertiary" @click="addOrganizer">
        <template v-if="isAdding">
          <Icon name="mdi:loading" class="size-4 animate-spin" />
        </template>
        <template v-else>
          {{ t("manage.organizers.add") }}
        </template>
      </dot-button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <Icon name="mdi:loading" class="size-6 animate-spin text-text-secondary" />
    </div>

    <!-- Organizers list -->
    <div v-else-if="organizers.length > 0" class="flex flex-col gap-2">
      <div
        v-for="organizer in organizers"
        :key="organizer.address"
        class="group flex items-center justify-between rounded-xl border border-border-default bg-surface-card px-4 py-3"
      >
        <div class="flex flex-col gap-1">
          <span class="font-mono text-sm text-text-primary" :title="organizer.address">
            {{ shortenAddress(organizer.address) }}
          </span>
          <span class="text-xs text-text-secondary">
            {{ t("manage.organizers.addedOn", { date: formatDate(organizer.createdAt) }) }}
          </span>
        </div>
        <button
          class="flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-red-100 hover:text-red-500 disabled:opacity-50"
          :disabled="removingAddress === organizer.address"
          :title="t('manage.organizers.remove')"
          @click="removeOrganizer(organizer.address)"
        >
          <Icon v-if="removingAddress === organizer.address" name="mdi:loading" class="size-4 animate-spin" />
          <Icon v-else name="mdi:close" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-default py-8 text-center"
    >
      <Icon name="mdi:account-group-outline" class="size-8 text-text-secondary" />
      <p class="text-sm text-text-secondary">{{ t("manage.organizers.empty") }}</p>
    </div>

    <!-- Error message -->
    <p v-if="fetchError" class="text-center text-sm text-red-500">
      {{ fetchError }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { Memo } from "~/types/memo";

interface Organizer {
  address: string;
  addedBy: string;
  createdAt: string;
}

const props = defineProps<{
  drop: Memo;
}>();

const { t } = useI18n();

const organizers = ref<Organizer[]>([]);
const isLoading = ref(true);
const isAdding = ref(false);
const removingAddress = ref<string | null>(null);
const newAddress = ref("");
const inputError = ref<string | undefined>();
const fetchError = ref<string | undefined>();

const fetchOrganizers = async () => {
  isLoading.value = true;
  fetchError.value = undefined;

  try {
    const response = await $fetch<{ organizers: Organizer[] }>(
      `/api/manage/created/${props.drop.chain}/${props.drop.id}/organizers`,
    );
    organizers.value = response.organizers;
  } catch (error) {
    console.error("Failed to fetch organizers:", error);
    fetchError.value = t("manage.organizers.fetchError");
  } finally {
    isLoading.value = false;
  }
};

const addOrganizer = async () => {
  const address = newAddress.value.trim();
  if (!address || isAdding.value || inputError.value || !isValidSubstrateAddress(address)) return;

  isAdding.value = true;

  try {
    await $fetch(`/api/manage/created/${props.drop.chain}/${props.drop.id}/organizers`, {
      method: "POST",
      body: { address },
    });

    await fetchOrganizers();

    newAddress.value = "";
  } catch (error: unknown) {
    console.error("Failed to add organizer:", error);
    const fetchErr = error as { statusCode?: number; statusMessage?: string };
    inputError.value =
      fetchErr.statusCode === 400
        ? fetchErr.statusMessage || t("manage.organizers.invalidAddress")
        : t("manage.organizers.addError");
  } finally {
    isAdding.value = false;
  }
};

const removeOrganizer = async (address: string) => {
  removingAddress.value = address;

  try {
    await $fetch(`/api/manage/created/${props.drop.chain}/${props.drop.id}/organizers/${address}`, {
      method: "DELETE",
    });

    organizers.value = organizers.value.filter((o) => o.address !== address);
  } catch (error) {
    console.error("Failed to remove organizer:", error);
  } finally {
    removingAddress.value = null;
  }
};

const shortenAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

watch(newAddress, (address) => {
  const trimmed = address.trim();
  if (trimmed && !isValidSubstrateAddress(trimmed)) {
    inputError.value = t("manage.organizers.invalidAddress");
  } else {
    inputError.value = undefined;
  }
});

onMounted(fetchOrganizers);
</script>
