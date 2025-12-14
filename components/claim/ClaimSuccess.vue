<template>
  <template v-if="claimedUrl">
    <a :href="claimedUrl" class="block w-full">
      <dot-button class="w-full" variant="primary" size="large">
        {{ t("claim.seeInGallery", { name: memoName ?? "MEMO" }) }}
      </dot-button>
    </a>
    <div class="flex w-full flex-col items-center gap-2">
      <small class="dark:text-white">{{ t("claim.wantToShare") }}</small>
      <span class="mb-10 flex gap-2">
        <div class="flex cursor-pointer items-center gap-2" @click="shareOnTelegram(shareMessage, claimedUrl)">
          <div class="overflow-hidden rounded-full border border-white">
            <img src="/socials/telegram.webp" alt="Telegram" class="size-10" />
          </div>
        </div>
        <div class="flex cursor-pointer items-center gap-2" @click="shareOnX(shareMessage, claimedUrl)">
          <div class="overflow-hidden rounded-full border border-white">
            <img src="/socials/x.webp" alt="X" class="size-10" />
          </div>
        </div>
      </span>
    </div>
  </template>
</template>

<script setup lang="ts">
const { shareOnTelegram, shareOnX } = useSocials();
const { t } = useI18n();

defineProps<{
  claimedUrl: string | null;
  memoName?: string;
  shareMessage: string;
}>();
</script>
