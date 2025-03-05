<template>
  <div class="grid grid-cols-1 gap-x-8 md:grid-cols-3">
    <!-- Customize form -->
    <div class="flex w-full flex-col justify-center gap-8 md:w-auto">
      <!-- Custom image -->
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.title") }}</h2>

        <div class="flex flex-col">
          <div class="flex w-full items-center justify-between">
            <b class="text-base font-normal">{{ $t("manage.customize.customPreviewImage") }}</b>
            <dot-switch v-model="isCustomPreview" />
          </div>
          <p class="w-2/3 !text-text-secondary">{{ $t("manage.customize.customPreviewImageHint") }}</p>
        </div>
      </div>
      <!-- Text content -->
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.textContent") }}</h2>
        <div class="flex flex-col gap-1">
          <div class="flex w-full items-center justify-between">
            <b class="text-base font-normal">{{ $t("manage.customize.heading") }}</b>
            <p>0/40</p>
          </div>
          <dot-text-input :placeholder="$t('common.text')" />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              <b class="text-base font-normal">{{ $t("manage.customize.subheading") }}</b>
              <p class="!text-text-secondary">({{ $t("common.optional") }})</p>
            </span>
            <p>0/40</p>
          </div>
          <dot-text-area :placeholder="$t('common.text')" />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex w-full items-center justify-between">
            <b class="text-base font-normal">{{ $t("manage.customize.buttonText") }}</b>
            <p>0/40</p>
          </div>
          <dot-text-input :placeholder="$t('common.claim')" />
        </div>
      </div>
      <!-- Socials -->
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.socials") }}</h2>
        <p class="!text-text-secondary">{{ $t("manage.customize.socialsHint") }}</p>
        <dot-text-input placeholder="Telegram">
          <template #prefix>
            <Icon name="mdi:telegram" class="text-text-primary" />
          </template>
        </dot-text-input>
        <dot-text-input placeholder="@instagram">
          <template #prefix>
            <Icon name="mdi:instagram" class="text-text-primary" />
          </template>
        </dot-text-input>
        <dot-text-input placeholder="website.com">
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
      <dot-button>{{ $t("common.saveChanges") }}</dot-button>
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
import type { Memo } from "~/types/memo";

defineProps<{
  drop: Memo;
}>();
const isCustomPreview = ref(false);
const darkMode = ref(false);
const accentColor = ref("#4ADE80");

// const GAMMA = 2.4;

// function luminance(r: number, g: number, b: number) {
//   const a = [r, g, b].map((v) => {
//     v /= 255;
//     return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
//   });
//   return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
// }

// function contrast(rgb1, rgb2) {
//   const lum1 = luminance(...rgb1);
//   const lum2 = luminance(...rgb2);
//   const brightest = Math.max(lum1, lum2);
//   const darkest = Math.min(lum1, lum2);
//   return (brightest + 0.05) / (darkest + 0.05);
// }
</script>
