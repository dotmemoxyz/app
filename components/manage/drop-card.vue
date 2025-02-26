<template>
  <div class="flex min-w-[320px] flex-col items-center gap-4 rounded-3xl bg-surface-card p-4">
    <!-- Heading -->
    <div class="flex w-full items-center justify-between border-b border-[#E5E5E5] pb-2">
      <div class="flex items-center gap-2">
        <template v-if="startsIn">
          <span class="size-[10px] rounded-full bg-[#ABD9FE]" />
          <p class="!text-secondary text-[14px]">{{ $t("manage.drop.upcoming") }}</p>
        </template>
        <template v-if="isExpired">
          <span class="size-[10px] rounded-full bg-[#606060]" />
          <p class="!text-secondary text-[14px]">{{ $t("manage.drop.inactive") }}</p>
        </template>
        <template v-else>
          <span class="size-[10px] rounded-full bg-[#49DE80]" />
          <p class="!text-secondary text-[14px]">{{ $t("manage.drop.active") }}</p>
        </template>
      </div>
      <p class="!text-secondary text-[14px]">{{ remainingTime }}</p>
    </div>
    <!-- Image -->
    <div class="aspect-square size-[200px] overflow-hidden rounded-full border-[6px] border-white bg-white">
      <img :src="props.drop.image" class="h-full rounded-full" />
    </div>
    <!-- Title -->
    <b class="text-center text-[24px]">{{ props.drop.name }}</b>
    <!-- Info -->
    <div class="flex w-full flex-col gap-2">
      <div class="flex w-full items-center justify-between">
        <p class="!text-secondary text-[14px]">{{ $t("manage.drop.progress") }}</p>
        <p class="!text-secondary text-[14px]">
          {{
            $t("manage.drop.claimed", {
              part: minted,
              total: maxMints,
            })
          }}
        </p>
      </div>
      <!-- Progress bar -->
      <div class="h-2 w-full rounded-full bg-[#E5E5E5]">
        <div
          class="h-full rounded-full bg-[#49DE80]"
          :style="{
            width: `${currentProgress}%`,
          }"
        />
      </div>
    </div>
    <div
      class="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#DEDEDE] bg-white p-4 hover:opacity-70"
      @click="navigateTo(`/manage/${props.drop.id}`)"
    >
      <p class="text-[14px] font-normal !text-black">{{ $t("manage.drop.manageDrop") }}</p>
      <Icon name="mdi:arrow-right" class="size-[20px] text-black" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";
import { DateTime, Duration } from "luxon";
import type { Memo } from "~/types/memo";
import { getFreeMints } from "~/utils/sdk/query";
const props = defineProps<{
  drop: Memo;
}>();
const { locale, t } = useI18n();

// Starts in
const startsIn = computed<string | null>(() => {
  const date = DateTime.fromSQL(props.drop.createdAt);
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
  const date = DateTime.fromSQL(props.drop.expiresAt);
  const now = DateTime.now();
  return date.diff(now, ["seconds"]).as("seconds") < 0;
});

const remainingTime = computed<string>(() => {
  if (isExpired.value) {
    return t("manage.drop.expired");
  }
  const date = DateTime.fromSQL(props.drop.expiresAt);
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
const maxMints = ref(0);
const minted = ref(0);
const remaining = ref(0);
const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
const loadingLimitInfo = ref(true);
watch(
  props.drop,
  async (data) => {
    if (data) {
      loadingLimitInfo.value = true;
      const api = await apiInstanceByPrefix(data.chain);
      const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(api, data.collection);
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

const currentProgress = computed<number>(() => (minted.value / maxMints.value) * 100);
</script>
