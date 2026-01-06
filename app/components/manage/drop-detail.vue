<template>
  <div class="flex w-full justify-between gap-8 rounded-[24px] bg-surface-card p-[32px]">
    <!-- Image -->
    <div
      :style="`view-transition-name: drop-${props.drop.id}`"
      class="size-[165px] min-h-[165px] min-w-[165px] overflow-hidden rounded-full border-[6px] border-white bg-white"
    >
      <img :src="props.drop.image" class="h-full rounded-full" />
    </div>
    <!-- Info -->
    <div v-if="ownership === 'created' || ownership === 'organized'" class="flex flex-1 flex-col justify-between py-4">
      <h2 class="text-[24px]">{{ props.drop.customize.heading ?? props.drop.name }}</h2>
      <span class="flex items-center gap-8">
        <div v-if="isExpired" class="flex w-[88px] items-center justify-center rounded-full bg-border-default p-[5px]">
          <p class="text-[14px] leading-[17px] !text-text-placeholder">{{ $t("manage.drop.inactive") }}</p>
        </div>
        <div v-else class="flex w-[80px] items-center justify-center rounded-full bg-accent-primary-light p-[5px]">
          <p class="text-[14px] leading-[17px] !text-accent-primary-dark">{{ $t("manage.drop.active") }}</p>
        </div>
        <p class="text-[14px] !text-[#606060]">{{ remainingTime }}</p>
      </span>
      <span v-if="ownership === 'created'" class="flex items-center gap-4">
        <a
          class="flex h-fit cursor-pointer select-none items-center gap-2 rounded-xl bg-white p-2 hover:opacity-70"
          :href="`/claim/${props.drop.code}`"
          target="_blank"
        >
          <p class="text-[14px] !text-black">{{ $t("manage.drop.viewClaimPage") }}</p>
          <Icon name="mdi:arrow-top-right" class="size-[16px] !text-black" />
        </a>
        <div
          id="copy-link"
          class="flex h-fit cursor-pointer select-none items-center gap-2 rounded-xl bg-white p-2 hover:opacity-70"
          @click="copyLink"
        >
          <Icon name="mdi:content-copy" class="size-[16px] !text-black" />
          <p class="text-[14px] !text-black">{{ $t("manage.drop.copyLink") }}</p>
        </div>
      </span>
    </div>
    <div v-else class="flex flex-1 flex-col py-4">
      <h2 class="text-[24px] leading-[24px]">{{ props.drop.customize.heading ?? props.drop.name }}</h2>
      <div class="mt-[17px] flex gap-x-10">
        <!-- Created by -->
        <p class="text-[14px] !text-[#606060]">
          by:
          <span class="cursor-copy border-b border-dotted border-black" @click="owner ? clipboard.copy(owner) : null">
            {{ owner ? addressShortener(owner) : "" }}
          </span>
        </p>
        <span class="hidden items-center gap-2 md:flex">
          <p class="text-[14px] font-normal !text-text-secondary">
            {{ DateTime.fromISO(props.drop.createdAt).toLocaleString(DateTime.DATE_MED) }} -
            {{ DateTime.fromISO(props.drop.expiresAt).toLocaleString(DateTime.DATE_MED) }}
          </p>
          <p class="text-[14px] font-normal !text-text-placeholder">
            {{ DateTime.fromISO(props.drop.expiresAt).offsetNameShort }}
          </p>
        </span>
      </div>
      <div class="mt-[21px] flex justify-between">
        <p class="max-w-[495px] text-[14px] !text-[#606060]">
          {{ props.drop.customize.subheading ?? props.drop.description }}
        </p>
        <!-- Socials -->
        <div class="flex flex-row items-end justify-end gap-3">
          <!-- Telegram -->
          <a
            v-if="props.drop.customize.telegram"
            :href="getTelegramUrl(props.drop.customize.telegram)"
            target="_blank"
            class="flex h-[45px] items-center gap-[6px] rounded-xl bg-background px-[14px]"
            rel="noopener noreferrer"
          >
            <icon name="mdi:telegram" size="24" class="text-text-primary" />
            <p class="text-[14px]">@{{ props.drop.customize.telegram.split("/").pop() }}</p>
          </a>
          <!-- Instagram -->
          <a
            v-if="props.drop.customize.instagram"
            :href="getInstagramUrl(props.drop.customize.instagram)"
            target="_blank"
            class="flex h-[45px] items-center gap-[6px] rounded-xl bg-background px-[14px]"
            rel="noopener noreferrer"
          >
            <icon name="mdi:instagram" size="24" class="text-text-primary" />
            <p class="text-[14px]">@{{ props.drop.customize.instagram.split("/").pop() }}</p>
          </a>
          <!-- Website -->
          <a
            v-if="props.drop.customize.website"
            :href="props.drop.customize.website"
            target="_blank"
            class="flex h-[45px] items-center gap-[6px] rounded-xl bg-background px-[14px]"
            rel="noopener noreferrer"
          >
            <icon name="mdi:web" size="24" class="text-text-primary" />
            <p class="text-[14px]">{{ formatWeb(props.drop.customize.website) }}</p>
          </a>
        </div>
      </div>
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
import { DateTime, Duration } from "luxon";
import type { MemoDetail, Ownership, UniqCollection } from "~/types/memo";
import { emojiBlast } from "emoji-blast";
import { getClient } from "@kodadot1/uniquery";
import { useClipboard } from "@vueuse/core";

const clipboard = useClipboard();

const props = defineProps<{
  drop: MemoDetail;
  ownership: Ownership;
}>();
const { locale } = useI18n();
// Check if drop is expired
const isExpired = computed<boolean>(() => {
  const date = DateTime.fromISO(props.drop.expiresAt);
  const now = DateTime.now();
  return date.diff(now, ["seconds"]).as("seconds") < 0;
});

const remainingTime = computed<string>(() => {
  if (isExpired.value) {
    // Display end date if expired
    return DateTime.fromISO(props.drop.expiresAt).toFormat("dd.MM.yyyy");
  }
  const date = DateTime.fromISO(props.drop.expiresAt);
  const startDate = DateTime.fromISO(props.drop.createdAt);
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

const client = computed(() => getClient(props.drop.chain));

type QueryCollectionsResponse = {
  collection: UniqCollection;
};

const { data: owner } = useAsyncData(
  "owner",
  async () => {
    const query = client.value.collectionById(props.drop.id, ["currentOwner"]);
    return client.value.fetch<QueryCollectionsResponse>(query);
  },
  {
    transform: ({ data }) => data.collection.currentOwner,
  },
);

// Copy link
const copyLink = () => {
  const url = `${window.location.origin}/claim/${props.drop.code}`;
  navigator.clipboard.writeText(url);
  const element = document.getElementById("copy-link");
  if (!element) return;
  emojiBlast({
    emojiCount: 10,
    position() {
      return {
        x: element.offsetLeft + element.clientWidth / 2,
        y: element.offsetTop + element.clientHeight / 2,
      };
    },
  });
};
</script>
