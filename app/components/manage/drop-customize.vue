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
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.heading }">
              {{ heading?.length ?? 0 }}/40
            </p>
          </div>
          <dot-text-input v-model="heading" :placeholder="$t('common.text')" maxlength="40" />
          <p v-if="errors.heading" class="mt-1 text-xs !text-red-500">
            {{ errors.heading }}
          </p>
        </div>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              <b class="text-base !font-normal">{{ $t("manage.customize.subheading") }}</b>
              <p class="text-xs !font-normal !text-text-secondary">({{ $t("common.optional") }})</p>
            </span>
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.subheading }">
              {{ subheading?.length ?? 0 }}/300
            </p>
          </div>
          <dot-text-area v-model="subheading" :placeholder="$t('common.text')" maxlength="300" />
          <p v-if="errors.subheading" class="mt-1 text-xs !text-red-500">
            {{ errors.subheading }}
          </p>
        </div>
        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.buttonText") }}</b>
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.claimText }">
              {{ claimText?.length ?? 0 }}/40
            </p>
          </div>
          <dot-text-input v-model="claimText" :placeholder="$t('common.claim')" maxlength="40" />
          <p v-if="errors.claimText" class="mt-1 text-xs !text-red-500">
            {{ errors.claimText }}
          </p>
        </div>
      </div>
      <!-- Socials -->
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.socials") }}</h2>
        <p class="!text-text-secondary">{{ $t("manage.customize.socialsHint") }}</p>
        <dot-text-input v-model="telegram" placeholder="Telegram">
          <template #prefix>
            <Icon name="mdi:telegram" class="text-text-primary" />
          </template>
        </dot-text-input>
        <p v-if="errors.telegram" class="mt-1 text-xs !text-red-500">
          {{ errors.telegram }}
        </p>
        <dot-text-input v-model="instagram" placeholder="@instagram">
          <template #prefix>
            <Icon name="mdi:instagram" class="text-text-primary" />
          </template>
        </dot-text-input>
        <p v-if="errors.instagram" class="mt-1 text-xs !text-red-500">
          {{ errors.instagram }}
        </p>
        <dot-text-input v-model="twitter" placeholder="@x">
          <template #prefix>
            <Icon name="simple-icons:x" class="text-text-primary" />
          </template>
        </dot-text-input>
        <p v-if="errors.twitter" class="mt-1 text-xs !text-red-500">
          {{ errors.twitter }}
        </p>
        <dot-text-input v-model="website" placeholder="website.com">
          <template #prefix>
            <Icon name="mdi:web" class="text-text-primary" />
          </template>
        </dot-text-input>
        <p v-if="errors.website" class="mt-1 text-xs !text-red-500">
          {{ errors.website }}
        </p>
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
          <p v-if="errors.accentColor" class="mt-1 text-xs !text-red-500">
            {{ errors.accentColor }}
          </p>
        </div>
        <div class="flex justify-between">
          <b class="text-base font-normal !text-text-secondary">{{ $t("manage.customize.contrastCheck") }}</b>
          <b class="text-base font-normal !text-text-secondary">21:1</b>
        </div>
      </div>
      <div class="flex w-full flex-col items-center gap-2">
        <dot-button :disabled="loading || !meta.valid" class="w-full" @click="save">
          {{ buttonLabel }}
        </dot-button>
        <p v-if="updateError" class="text-center text-sm !text-red-500">{{ updateError }}</p>
        <p v-else-if="!meta.valid" class="text-center text-sm !text-yellow-500">
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
import { toTypedSchema } from "@vee-validate/zod";
import { useForm, useField } from "vee-validate";
import * as zod from "zod";
import type { Memo, MemoCustomize } from "~/types/memo";
import { normalizeUrl } from "~/utils/web";

const props = defineProps<{
  drop: Memo;
}>();

const { t } = useI18n();

const validationSchema = toTypedSchema(
  zod.object({
    image: zod.string().trim().optional(),
    heading: zod
      .string()
      .trim()
      .max(40, { message: t("manage.customize.headingTooLong") })
      .optional(),
    subheading: zod
      .string()
      .trim()
      .max(300, { message: t("manage.customize.subheadingTooLong") })
      .optional(),
    claimText: zod
      .string()
      .trim()
      .max(40, { message: t("manage.customize.claimTextTooLong") })
      .optional(),
    telegram: zod.preprocess(
      normalizeHandle,
      zod
        .string()
        .refine((val) => !val || /^[a-zA-Z0-9_]{5,32}$/.test(val), {
          message: t("manage.customize.invalidTelegram"),
        })
        .optional(),
    ),
    instagram: zod.preprocess(
      normalizeHandle,
      zod
        .string()
        .refine((val) => !val || /^[a-zA-Z0-9._]{1,30}$/.test(val), {
          message: t("manage.customize.invalidInstagram"),
        })
        .optional(),
    ),
    twitter: zod.preprocess(
      normalizeHandle,
      zod
        .string()
        .refine((val) => !val || /^[a-zA-Z0-9_]{4,15}$/.test(val), {
          message: t("manage.customize.invalidTwitter"),
        })
        .optional(),
    ),
    website: zod.preprocess(
      (val) => (typeof val === "string" ? normalizeUrl(val) : ""),
      zod
        .string()
        .url({ message: t("manage.customize.invalidUrl") })
        .optional()
        .or(zod.literal("")),
    ),
    darkMode: zod.boolean(),
    accentColor: zod
      .string()
      .trim()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: t("manage.customize.invalidHexColor"),
      })
      .optional(),
  }),
);

const { errors, meta } = useForm({
  validationSchema,
  initialValues: {
    image: props.drop.customize?.image ?? undefined,
    heading: props.drop.customize?.heading ?? "",
    subheading: props.drop.customize?.subheading ?? "",
    claimText: props.drop.customize?.claimText ?? "",
    telegram: props.drop.customize?.telegram ?? "",
    instagram: props.drop.customize?.instagram ?? "",
    twitter: props.drop.customize?.twitter ?? "",
    website: props.drop.customize?.website ? formatWeb(props.drop.customize.website) : "",
    darkMode: props.drop.customize?.darkMode ?? false,
    accentColor: props.drop.customize?.accentColor ?? "#4ADE80",
  },
});

const isCustomPreview = ref(false);
const { value: image } = useField<string | undefined>("image");
const { value: heading } = useField<string>("heading");
const { value: subheading } = useField<string>("subheading");
const { value: claimText } = useField<string>("claimText");
const { value: telegram } = useField<string>("telegram");
const { value: instagram } = useField<string>("instagram");
const { value: twitter } = useField<string>("twitter");
const { value: website } = useField<string>("website");
const { value: darkMode } = useField<boolean>("darkMode");
const { value: accentColor } = useField<string>("accentColor");

const editedData = computed<Memo>(() => {
  return {
    ...props.drop,
    customize: {
      image: image.value,
      heading: heading.value,
      subheading: subheading.value,
      claimText: claimText.value,
      telegram: telegram.value,
      instagram: instagram.value,
      twitter: twitter.value,
      website: website.value,
      darkMode: darkMode.value,
      accentColor: accentColor.value,
    },
  };
});

const loading = ref(false);
const updateError = ref<string | null>(null);

const save = async () => {
  if (!meta.value.valid) {
    return;
  }

  const body: MemoCustomize = {
    image: image.value || undefined,
    heading: heading.value || undefined,
    subheading: subheading.value || undefined,
    claimText: claimText.value || undefined,
    telegram: parseUsername(telegram.value) || undefined,
    instagram: parseUsername(instagram.value) || undefined,
    twitter: parseUsername(twitter.value) || undefined,
    website: normalizeUrl(website.value) || undefined,
    darkMode: darkMode.value,
    accentColor: accentColor.value || undefined,
  };

  updateError.value = null;
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
