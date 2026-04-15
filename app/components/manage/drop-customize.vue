<template>
  <div class="flex flex-col gap-8">
    <dot-tabs v-model="selectedSection" :options="customizeSections" />

    <manage-drop-customize-claim-page
      v-show="selectedSection === 'claim-page'"
      :drop="drop"
      :saved-customize="savedCustomize"
      :loading="loading"
      :update-error="updateError"
      @submit="saveClaimPage"
    />

    <manage-drop-customize-success-modal
      v-show="selectedSection === 'success-modal'"
      :drop="drop"
      :saved-customize="savedCustomize"
      :loading="loading"
      :update-error="updateError"
      @submit="saveSuccessModal"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Memo, MemoClaimPageCustomize, MemoCustomize, MemoSuccessModalCustomize } from "~/types/memo";
import { normalizeUrl, parseUsername } from "~/utils/web";

const TELEGRAM_USERNAME_PATTERN = /^[a-zA-Z0-9_]{5,32}$/;
const INSTAGRAM_USERNAME_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;
const TWITTER_USERNAME_PATTERN = /^[a-zA-Z0-9_]{4,15}$/;
const HEX_COLOR_PATTERN = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const props = defineProps<{
  drop: Memo;
}>();

const { t } = useI18n();

const customizeSections = [
  { value: "claim-page", label: t("manage.customize.tabs.claimPage") },
  { value: "success-modal", label: t("manage.customize.tabs.successModal") },
];

function sanitizeCustomizeForSave(customize?: MemoCustomize | null): MemoCustomize {
  const source = customize ?? { darkMode: false };
  const telegram = source.telegram ? parseUsername(source.telegram) : undefined;
  const instagram = source.instagram ? parseUsername(source.instagram) : undefined;
  const twitter = source.twitter ? parseUsername(source.twitter) : undefined;
  const website = source.website ? normalizeUrl(source.website) : undefined;

  return {
    ...source,
    telegram: telegram && TELEGRAM_USERNAME_PATTERN.test(telegram) ? telegram : undefined,
    instagram: instagram && INSTAGRAM_USERNAME_PATTERN.test(instagram) ? instagram : undefined,
    twitter: twitter && TWITTER_USERNAME_PATTERN.test(twitter) ? twitter : undefined,
    website:
      website &&
      (() => {
        try {
          return new URL(website).toString();
        } catch {
          return undefined;
        }
      })(),
    accentColor: source.accentColor && HEX_COLOR_PATTERN.test(source.accentColor) ? source.accentColor : undefined,
  };
}

const selectedSection = ref("claim-page");
const loading = ref(false);
const updateError = ref<string | null>(null);
const savedCustomize = ref<MemoCustomize>(sanitizeCustomizeForSave(props.drop.customize));

watch(
  () => props.drop.customize,
  (customize) => {
    savedCustomize.value = sanitizeCustomizeForSave(customize);
  },
);

watch(selectedSection, () => {
  updateError.value = null;
});

const saveCustomization = async (customize: MemoCustomize) => {
  updateError.value = null;
  loading.value = true;

  try {
    const body = sanitizeCustomizeForSave(customize);

    await $fetch(`/api/manage/created/${props.drop.chain}/${props.drop.id}/customization`, {
      method: "PUT",
      body,
    });

    savedCustomize.value = body;
  } catch (error) {
    console.error("Error updating drop customization:", error);
    updateError.value = t("manage.customize.saveError");
  } finally {
    loading.value = false;
  }
};

const saveClaimPage = async (claimPageCustomize: MemoClaimPageCustomize) => {
  await saveCustomization({
    ...savedCustomize.value,
    ...claimPageCustomize,
    success: savedCustomize.value.success,
  });
};

const saveSuccessModal = async (successCustomize: MemoSuccessModalCustomize) => {
  await saveCustomization({
    ...savedCustomize.value,
    success: successCustomize,
  });
};
</script>
