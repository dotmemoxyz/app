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
            <p class="text-xs font-normal" :class="{ '!text-red-500': heading.length > 40 }">{{ heading.length }}/40</p>
          </div>
          <dot-text-input v-model="heading" :placeholder="$t('common.text')" maxlength="40" />
          <p v-if="heading.length > 40" class="mt-1 text-xs !text-red-500">
            {{ $t("manage.customize.headingTooLong") }}
          </p>
        </div>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              <b class="text-base !font-normal">{{ $t("manage.customize.subheading") }}</b>
              <p class="text-xs !font-normal !text-text-secondary">({{ $t("common.optional") }})</p>
            </span>
            <p class="text-xs font-normal" :class="{ '!text-red-500': subheading.length > 300 }">
              {{ subheading.length }}/300
            </p>
          </div>
          <dot-text-area v-model="subheading" :placeholder="$t('common.text')" maxlength="300" />
          <p v-if="subheading.length > 300" class="mt-1 text-xs !text-red-500">
            {{ $t("manage.customize.subheadingTooLong") }}
          </p>
        </div>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.buttonText") }}</b>
            <p class="text-xs font-normal" :class="{ '!text-red-500': claimText.length > 40 }">
              {{ claimText.length }}/40
            </p>
          </div>
          <dot-text-input v-model="claimText" :placeholder="$t('common.claim')" maxlength="40" />
          <p v-if="claimText.length > 40" class="mt-1 text-xs !text-red-500">
            {{ $t("manage.customize.claimTextTooLong") }}
          </p>
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
      <div class="flex w-full flex-col items-center gap-2">
        <dot-button :disabled="loading || !isValid" class="w-full" @click="save">
          {{ buttonLabel }}
        </dot-button>
        <p v-if="updateError" class="text-center text-sm !text-red-500">{{ updateError }}</p>
        <p v-else-if="!isValid" class="text-center text-sm !text-yellow-500">
          {{ $t("manage.customize.validationRequired") }}
        </p>
      </div>
    </div>
    <!-- Customize preview -->
    <div class="col-span-2 flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex w-[450px] justify-between">
          <h2 class="text-xl font-medium">{{ $t("manage.customize.preview") }}</h2>
          <p class="text-base font-normal !text-text-secondary">{{ $t("manage.customize.previewHint") }}</p>
        </div>
      </div>
      <manage-drop-preview :data="editedData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Memo, MemoCustomize } from "~/types/memo";

const props = defineProps<{
  drop: Memo;
}>();
const isCustomPreview = ref(false);
const imageIPFS = ref<string>();
const darkMode = ref(false);
const accentColor = ref(props.drop.customize?.accentColor ?? "#4ADE80");
const heading = ref(props.drop.customize?.heading ?? "");
const subheading = ref(props.drop.customize?.subheading ?? "");
const claimText = ref(props.drop.customize?.claimText ?? "");
const telegramLink = ref(props.drop.customize?.telegram ?? "");
const instagramLink = ref(props.drop.customize?.instagram ?? "");
const websiteLink = ref(props.drop.customize?.website ?? "");

const { t } = useI18n();

const editedData = computed<Memo>(() => {
  return {
    ...props.drop,
    customize: {
      image: imageIPFS.value,
      heading: heading.value,
      subheading: subheading.value,
      claimText: claimText.value,
      telegram: telegramLink.value,
      instagram: instagramLink.value,
      website: websiteLink.value,
      darkMode: darkMode.value,
      accentColor: accentColor.value,
    },
  };
});

const loading = ref(false);
const updateError = ref<string | null>(null);

// Validation computed properties
const isValid = computed(() => {
  return heading.value.length <= 40 && subheading.value.length <= 300 && claimText.value.length <= 40;
});

const validationErrors = computed(() => {
  const errors: string[] = [];
  if (heading.value.length > 40) {
    errors.push(t("manage.customize.headingTooLong"));
  }
  if (subheading.value.length > 300) {
    errors.push(t("manage.customize.subheadingTooLong"));
  }
  if (claimText.value.length > 40) {
    errors.push(t("manage.customize.claimTextTooLong"));
  }
  return errors;
});

const save = async () => {
  // Validate before saving
  if (!isValid.value) {
    updateError.value = validationErrors.value.join(". ");
    return;
  }
  const body: MemoCustomize = {
    image: imageIPFS.value || undefined,
    heading: heading.value || undefined,
    subheading: subheading.value || undefined,
    claimText: claimText.value || undefined,
    telegram: telegramLink.value || undefined,
    instagram: instagramLink.value || undefined,
    website: websiteLink.value || undefined,
    darkMode: darkMode.value || undefined,
    accentColor: accentColor.value || undefined,
  };
  updateError.value = null; // Reset error message
  loading.value = true;

  try {
    await $fetch(`/api/manage/created/${props.drop.chain}/${props.drop.id}/customization`, {
      method: "PUT",
      body,
    });
  } catch (error) {
    console.error("Error updating drop customization:", error);
    updateError.value = "Failed to save changes. Please try again.";
  } finally {
    loading.value = false;
  }
};

const buttonLabel = computed(() => {
  if (loading.value) {
    return t("common.saving");
  }
  return t("common.saveChanges");
});
</script>
