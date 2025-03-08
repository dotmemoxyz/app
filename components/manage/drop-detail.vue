<template>
  <div class="flex w-full justify-between gap-8 rounded-xl bg-surface-card p-[32px]">
    <!-- Image -->
    <div
      class="size-[165px] min-h-[165px] min-w-[165px] overflow-hidden rounded-full border-[6px] border-white bg-white"
    >
      <img :src="props.drop.image" class="h-full rounded-full" />
    </div>
    <!-- Info -->
    <div class="flex flex-1 flex-col justify-between py-4">
      <h2 class="text-[24px]">{{ props.drop.name }}</h2>
      <span class="flex items-center gap-8">
        <div v-if="isExpired" class="flex items-center justify-center rounded-full bg-[#c5c4c4] px-4 py-2">
          <p class="text-[14px] !text-[#898989]">{{ $t("manage.drop.inactive") }}</p>
        </div>
        <div v-else class="flex items-center justify-center rounded-full bg-accent-primary-light p-2">
          <p class="text-[14px] !text-accent-primary-dark">{{ $t("manage.drop.active") }}</p>
        </div>
        <p class="text-[14px] !text-[#606060]">{{ remainingTime }}</p>
      </span>
      <!-- TODO: Missing code in DTO -->
      <span class="flex items-center gap-4">
        <!-- <a
          class="flex h-fit cursor-pointer select-none items-center gap-2 rounded-xl bg-white p-2 hover:opacity-70"
          :href="`/claim/${props.drop.id}`"
          target="_blank"
        >
          <p class="text-[14px]">{{ $t("manage.drop.viewClaimPage") }}</p>
          <Icon name="mdi:arrow-top-right" class="size-[16px] text-black" />
        </a>
        <div
          id="copy-link"
          class="flex h-fit cursor-pointer select-none items-center gap-2 rounded-xl bg-white p-2 hover:opacity-70"
          @click="copyLink"
        >
          <Icon name="mdi:content-copy" class="size-[16px] text-black" />
          <p class="text-[14px]">{{ $t("manage.drop.copyLink") }}</p>
        </div> -->
      </span>
    </div>
    <!-- Actions -->
    <!-- TODO: Missing API implementation -->
    <div class="flex gap-4 py-4">
      <!-- <div class="flex h-fit cursor-not-allowed items-center gap-2 rounded-xl bg-white p-2 hover:opacity-70">
        <Icon name="mdi:pause" class="size-[24px] text-black" />
        <p class="text-[14px]">{{ $t("manage.drop.pause") }}</p>
      </div>
      <div class="flex h-fit w-fit cursor-not-allowed items-center gap-2 rounded-xl bg-white p-2 hover:opacity-70">
        <Icon name="mdi:trash-can" class="size-[24px] text-black" />
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";
import { DateTime, Duration } from "luxon";
import type { Memo } from "~/types/memo";
import { getFreeMints } from "~/utils/sdk/query";
// import { emojiBlast } from "emoji-blast";
const props = defineProps<{
  drop: Memo;
}>();
const { locale, t } = useI18n();
// Check if drop is expired
const isExpired = computed<boolean>(() => {
  const date = DateTime.fromSQL(props.drop.expiresAt);
  const now = DateTime.now();
  return date.diff(now, ["seconds"]).as("seconds") < 0;
});

const remainingTime = computed<string>(() => {
  if (isExpired.value) {
    // Display end date if expired
    return DateTime.fromSQL(props.drop.expiresAt).toFormat("dd.MM.yyyy");
  }
  const date = DateTime.fromSQL(props.drop.expiresAt);
  const startDate = DateTime.fromSQL(props.drop.createdAt);
  const now = DateTime.now();
  const diff = date.diff(now, ["days", "hours", "minutes", "seconds"]);
  // Return remaining time with locale
  if (diff.days > 0) {
    // Foramt MM.dd - MM.dd.yyyy
    return startDate.toFormat("dd.MM.") + " - " + date.toFormat("dd.MM.yyyy");
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

// Copy link
// const copyLink = () => {
//   const url = `${window.location.origin}/claim/${props.drop.id}`;
//   navigator.clipboard.writeText(url);
//   const element = document.getElementById("copy-link");
//   if (!element) return;
//   emojiBlast({
//     emojiCount: 10,
//     position() {
//       return {
//         x: element.offsetLeft + element.clientWidth / 2,
//         y: element.offsetTop + element.clientHeight / 2,
//       };
//     },
//   });
// };
</script>
