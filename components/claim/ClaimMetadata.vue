<template>
  <div class="flex w-full items-center justify-center rounded-[12px] bg-surface-card p-[16px] md:justify-between">
    <span class="hidden items-center gap-2 md:flex">
      <p class="text-[14px] font-normal !text-text-secondary">
        {{ DateTime.fromISO(createdAt).toLocaleString(DateTime.DATE_MED) }} -
        {{ DateTime.fromISO(expiresAt).toLocaleString(DateTime.DATE_MED) }}
      </p>
      <p class="text-[14px] font-normal !text-text-placeholder">
        {{ DateTime.fromISO(expiresAt).offsetNameShort }}
      </p>
    </span>
    <span class="flex flex-col gap-2 md:hidden">
      <span class="flex gap-2">
        <p class="text-[14px] font-normal !text-text-secondary">
          {{ DateTime.fromISO(createdAt).toLocaleString(DateTime.DATE_MED) }}
        </p>

        <p class="text-[14px] font-normal !text-text-placeholder">
          {{ DateTime.fromISO(expiresAt).offsetNameShort }}
        </p>
      </span>
      <Icon name="mdi:chevron-down" class="self-center text-text-placeholder" size="16" />
      <span class="flex gap-2">
        <p class="text-[14px] font-normal !text-text-secondary">
          {{ DateTime.fromISO(expiresAt).toLocaleString(DateTime.DATE_MED) }}
        </p>
        <p class="text-[14px] font-normal !text-text-placeholder">
          {{ DateTime.fromISO(expiresAt).offsetNameShort }}
        </p>
      </span>
    </span>

    <p v-if="loading" class="hidden text-[14px] font-normal !text-text-secondary md:block">
      {{ $t("claim.loading") }}...
    </p>
    <p v-else-if="maxMints !== null" class="hidden text-[14px] font-normal !text-text-secondary md:block">
      {{
        $t("claim.remaining", {
          free: remaining,
          total: maxMints,
        })
      }}
    </p>

    <div v-if="error" class="flex w-full justify-center">
      <small class="text-red-500 dark:text-white">{{ error }}</small>
    </div>
  </div>
  <!-- Mobile remaining mints -->
  <div class="flex w-full items-center justify-center rounded-[12px] bg-surface-card p-[16px] md:hidden">
    <p v-if="loading" class="text-[14px] font-normal !text-text-secondary">{{ $t("claim.loading") }}...</p>
    <p v-else class="text-[14px] font-normal !text-text-secondary">
      {{
        $t("claim.remaining", {
          free: remaining,
          total: maxMints,
        })
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

defineProps<{
  createdAt: string;
  expiresAt: string;
  remaining: number | null;
  maxMints: number | null;
  loading?: boolean;
  error?: string | null;
}>();
</script>
