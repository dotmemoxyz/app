<template>
  <div class="grid grid-cols-1 gap-x-8 md:grid-cols-3">
    <!-- Customize form -->
    <div class="flex w-full flex-col justify-center gap-8 md:w-auto">
      <!-- Custom image -->
      <div class="flex flex-col gap-4">
        <span class="flex items-center gap-2">
          <h2 class="text-xl font-medium">
            {{ $t("manage.customize.title") }}
          </h2>
          <div
            class="group relative flex h-[20px] w-[20px] cursor-default items-center justify-center rounded-full border-2 border-text-secondary px-2"
          >
            <span class="text-[12px] text-text-secondary">?</span>
            <span
              class="pointer-events-none absolute bottom-5 right-0 z-50 mt-2 w-64 rounded-lg border border-border-default bg-surface-card px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white"
            >
              {{ $t("manage.customize.titleHint") }}
            </span>
          </div>
        </span>

        <div class="flex flex-col">
          <div class="flex w-full items-center justify-between">
            <b class="text-base font-normal">{{ $t("manage.customize.customPreviewImage") }}</b>
            <dot-switch v-model="isCustomPreview" />
          </div>
          <p class="!text-sm !font-normal !text-text-secondary">
            {{ $t("manage.customize.customPreviewImageHint") }}
          </p>
        </div>
      </div>
      <!-- Text content -->
      <div class="flex flex-col gap-[42px]">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.textContent") }}</h2>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.heading") }}</b>
            <p class="text-xs font-normal">{{ heading.length }}/40</p>
          </div>
          <dot-text-input v-model="heading" :placeholder="$t('common.text')" />
        </div>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              <b class="text-base !font-normal">{{ $t("manage.customize.subheading") }}</b>
              <p class="text-xs !font-normal !text-text-secondary">({{ $t("common.optional") }})</p>
            </span>
            <p class="text-xs font-normal">{{ subheading.length }}/40</p>
          </div>
          <dot-text-area v-model="subheading" :placeholder="$t('common.text')" />
        </div>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.buttonText") }}</b>
            <p class="text-xs font-normal">{{ claimText.length }}/40</p>
          </div>
          <dot-text-input v-model="claimText" :placeholder="$t('common.claim')" />
        </div>
      </div>
      <!-- Socials -->
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.socials") }}</h2>
        <p class="!text-text-secondary">{{ $t("manage.customize.socialsHint") }}</p>
        <dot-text-input v-model="telegramLink" placeholder="Telegram">
          <template #prefix>
            <Icon name="mdi:telegram" class="text-text-primary" />
          </template>
        </dot-text-input>
        <dot-text-input v-model="instagramLink" placeholder="@instagram">
          <template #prefix>
            <Icon name="mdi:instagram" class="text-text-primary" />
          </template>
        </dot-text-input>
        <dot-text-input v-model="websiteLink" placeholder="website.com">
          <template #prefix>
            <Icon name="mdi:web" class="text-text-primary" />
          </template>
        </dot-text-input>
      </div>
      <!-- Colors -->
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.colors") }}</h2>
        <p class="!text-text-secondary">{{ $t("manage.customize.colorsHint") }}</p>

        <div class="flex w-full items-center justify-between">
          <b class="text-base font-normal">{{ $t("manage.customize.darkMode") }}</b>
          <dot-switch v-model="darkMode" />
        </div>
        <div class="flex flex-col gap-1">
          <b class="text-base font-normal">{{ $t("manage.customize.accentColor") }}</b>
          <dot-color-picker v-model="accentColor" />
        </div>
        <div class="flex justify-between">
          <b class="text-base font-normal !text-text-secondary">{{ $t("manage.customize.contrastCheck") }}</b>
          <b class="text-base font-normal !text-text-secondary">21:1</b>
        </div>
      </div>
      <dot-button @click="save">{{ $t("common.saveChanges") }}</dot-button>
    </div>
    <!-- Customize preview -->
    <div class="col-span-2 flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between">
          <h2 class="text-xl font-medium">{{ $t("manage.customize.preview") }}</h2>
          <p class="text-base font-normal !text-text-secondary">{{ $t("manage.customize.previewHint") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Memo, MemoCustomize } from "~/types/memo";

defineProps<{
  drop: Memo;
}>();
const isCustomPreview = ref(false);
const imageIPFS = ref<string>();
const darkMode = ref(false);
const accentColor = ref("#4ADE80");
const heading = ref("");
const subheading = ref("");
const claimText = ref("");
const telegramLink = ref("");
const instagramLink = ref("");
const websiteLink = ref("");

const save = async () => {
  const _payload: MemoCustomize = {
    image: imageIPFS.value,
    heading: heading.value,
    subheading: subheading.value,
    claimText: claimText.value,
    telegram: telegramLink.value,
    instagram: instagramLink.value,
    website: websiteLink.value,
    darkMode: darkMode.value,
    accentColor: accentColor.value,
  };
};
</script>
