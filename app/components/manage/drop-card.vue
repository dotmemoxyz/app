<template>
  <div class="flex min-w-[320px] flex-col items-center gap-[32px] rounded-[36px] bg-surface-card p-[24px]">
    <!-- Heading -->
    <div class="flex w-full flex-col justify-between gap-[16px]">
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-[6px]">
          <template v-if="startsIn">
            <span class="size-[10px] rounded-full bg-surface-blue" />
            <p class="text-[14px] leading-[18px] !text-text-secondary">{{ $t("manage.drop.upcoming") }}</p>
          </template>
          <template v-if="isExpired">
            <span class="size-[10px] rounded-full bg-text-placeholder" />
            <p class="text-[14px] leading-[18px] !text-text-secondary">{{ $t("manage.drop.inactive") }}</p>
          </template>
          <template v-else>
            <span class="size-[10px] rounded-full bg-accent-primary" />
            <p class="text-[14px] leading-[18px] !text-text-secondary">{{ $t("manage.drop.active") }}</p>
          </template>
        </div>
        <p class="text-[14px] leading-[18px] !text-text-secondary">{{ remainingTime }}</p>
      </div>
      <span class="w-full border-b border-border-default" />
    </div>
    <!-- Image -->
    <div class="flex flex-col items-center gap-[32px]">
      <div
        :style="`view-transition-name: drop-${props.drop.id}`"
        class="aspect-square max-h-[210px] min-h-[210px] min-w-[210px] max-w-[210px] overflow-hidden rounded-full border-[6px] border-surface-white bg-surface-white"
      >
        <img :src="props.drop.image" class="h-full rounded-full" />
      </div>
      <!-- Title -->
      <b class="text-center text-[24px] leading-[30px]">{{ props.drop.name }}</b>
    </div>
    <!-- Info -->
    <div v-if="ownership === 'created'" class="flex w-full flex-col gap-[24px]">
      <div class="flex flex-col gap-[16px]">
        <div class="flex w-full items-center justify-between">
          <p class="text-[14px] leading-[18px] !text-text-secondary">{{ $t("manage.drop.progress") }}</p>
          <p v-if="maxMints !== null" class="text-[14px] leading-[18px] !text-text-secondary">
            {{
              $t("manage.drop.claimed", {
                part: minted,
                total: maxMints,
              })
            }}
          </p>
        </div>
        <!-- Progress bar -->
        <div class="h-2 w-full rounded-full bg-border-default">
          <div
            class="h-full rounded-full bg-accent-primary"
            :style="{
              width: `${currentProgress}%`,
            }"
          />
        </div>
      </div>
      <a
        class="flex max-h-[45px] w-full cursor-pointer items-center justify-between rounded-xl border border-border-default bg-surface-white px-[14px] py-[16px] hover:opacity-70"
        :href="`/manage/${props.drop.chain}/${props.drop.id}?ownership=created`"
      >
        <p class="text-[14px] font-normal leading-[18px]">{{ $t("manage.drop.manageDrop") }}</p>
        <Icon name="mdi:arrow-right" class="size-[20px] text-text-primary" />
      </a>
    </div>
    <div v-else class="flex w-full flex-col gap-[24px]">
      <a
        class="flex max-h-[45px] w-full cursor-pointer items-center justify-between rounded-xl border border-border-default bg-surface-white px-[14px] py-[16px] hover:opacity-70"
        :href="`/manage/${props.drop.chain}/${props.drop.id}?ownership=collected`"
      >
        <p class="text-[14px] font-normal leading-[18px]">{{ $t("manage.drop.viewDrop") }}</p>
        <Icon name="mdi:arrow-right" class="size-[20px] text-text-primary" />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";
import { DateTime, Duration } from "luxon";
import type { Memo, Ownership } from "~/types/memo";
import { getFreeMints } from "~/utils/sdk/query";
const props = defineProps<{
  drop: Memo;
  ownership: Ownership;
}>();
const { locale } = useI18n();

// Starts in
const startsIn = computed<string | null>(() => {
  const date = DateTime.fromISO(props.drop.createdAt);

  const now = DateTime.now();
  const diff = date.diff(now, ["days", "hours", "minutes", "seconds"]);

  if (diff.as("seconds") < 0) {
    return null;
  }
  // Return remaining time with locale
  if (diff.days > 0) {
    return Duration.fromObject({ days: diff.days }, { locale: locale.value }).toHuman();
  } else if (diff.hours > 0) {
    return Duration.fromObject({ hours: diff.hours }, { locale: locale.value }).toHuman();
  } else if (diff.minutes > 0) {
    return Duration.fromObject({ minutes: diff.minutes }, { locale: locale.value }).toHuman();
  } else {
    return Duration.fromObject({ seconds: diff.seconds }, { locale: locale.value }).toHuman();
  }
});

// Check if drop is expired
const isExpired = computed<boolean>(() => {
  const date = DateTime.fromISO(props.drop.expiresAt);
  const now = DateTime.now();
  return date.diff(now, ["seconds"]).as("seconds") < 0;
});

const remainingTime = computed<string>(() => {
  if (isExpired.value) {
    // Return end date
    return DateTime.fromISO(props.drop.expiresAt).toFormat("dd.MM.yyyy");
  }
  const date = DateTime.fromISO(props.drop.expiresAt);
  const now = DateTime.now();
  const diff = date.diff(now, ["days", "hours", "minutes", "seconds"]);
  // Return remaining time with locale
  if (diff.days > 0) {
    return Duration.fromObject({ days: diff.days }, { locale: locale.value }).toHuman();
  } else if (diff.hours > 0) {
    return Duration.fromObject({ hours: diff.hours }, { locale: locale.value }).toHuman();
  } else if (diff.minutes > 0) {
    return Duration.fromObject({ minutes: diff.minutes }, { locale: locale.value }).toHuman();
  } else {
    return Duration.fromObject({ seconds: diff.seconds }, { locale: locale.value }).toHuman();
  }
});

// Minting info
const maxMints = ref<number | null>(0);
const minted = ref(0);
const remaining = ref<number | null>(0);
const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
const loadingLimitInfo = ref(true);
watch(
  () => props.drop,
  async (data) => {
    if (data) {
      loadingLimitInfo.value = true;
      const api = await apiInstanceByPrefix(data.chain);
      const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(api, data.id);
      maxMints.value = maxTokens;
      minted.value = mintedTokens;
      remaining.value = remainingMints;
      loadingLimitInfo.value = false;
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

const currentProgress = computed<number>(() => {
  if (maxMints.value === null || maxMints.value === 0) {
    return 0;
  }
  return (minted.value / maxMints.value) * 100;
});
</script>
