<template>
  <div class="grid grid-cols-1 gap-x-8 md:grid-cols-3">
    <div class="flex w-full flex-col justify-center gap-8 md:w-auto">
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.success.imageTitle") }}</h2>

        <div class="flex flex-col">
          <div class="flex w-full items-center justify-between">
            <b class="text-base font-normal">{{ $t("manage.customize.success.imageToggle") }}</b>
            <dot-switch v-model="isCustomImage" />
          </div>
          <p class="!text-sm !font-normal !text-text-secondary">
            {{ $t("manage.customize.success.imageHint") }}
          </p>
        </div>

        <div v-if="isCustomImage" class="flex flex-col gap-2">
          <dot-image-input v-model="customImageFile" :preview-src="uploaderPreviewSrc" />
          <p v-if="imageError" class="text-sm font-normal !text-red-500">
            {{ imageError }}
          </p>
          <p class="text-sm font-normal !text-text-secondary">
            {{ $t("manage.customize.customPreviewImageRequirements") }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-[42px]">
        <h2 class="text-xl font-medium">{{ $t("manage.customize.success.title") }}</h2>

        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.success.titleField") }}</b>
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.title }">{{ title?.length ?? 0 }}/80</p>
          </div>
          <dot-text-input v-model="title" :placeholder="$t('claim.success')" maxlength="80" />
          <p v-if="errors.title" class="mt-1 text-xs !text-red-500">
            {{ errors.title }}
          </p>
        </div>

        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              <b class="text-base !font-normal">{{ $t("manage.customize.success.descriptionField") }}</b>
              <p class="text-xs !font-normal !text-text-secondary">({{ $t("common.optional") }})</p>
            </span>
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.description }">
              {{ description?.length ?? 0 }}/300
            </p>
          </div>
          <dot-text-area v-model="description" :placeholder="$t('common.text')" maxlength="300" />
          <p v-if="errors.description" class="mt-1 text-xs !text-red-500">
            {{ errors.description }}
          </p>
        </div>

        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.success.shareHeadingField") }}</b>
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.shareHeading }">
              {{ shareHeading?.length ?? 0 }}/80
            </p>
          </div>
          <dot-text-input v-model="shareHeading" :placeholder="$t('claim.wantToShare')" maxlength="80" />
          <p v-if="errors.shareHeading" class="mt-1 text-xs !text-red-500">
            {{ errors.shareHeading }}
          </p>
        </div>

        <div class="flex flex-col gap-[16px]">
          <div class="flex w-full items-center justify-between">
            <b class="text-base !font-normal">{{ $t("manage.customize.success.primaryCtaField") }}</b>
            <p class="text-xs font-normal" :class="{ '!text-red-500': errors.primaryCtaLabel }">
              {{ primaryCtaLabel?.length ?? 0 }}/40
            </p>
          </div>
          <dot-text-input
            v-model="primaryCtaLabel"
            :placeholder="$t('claim.seeInGallery', { name: drop.name || 'MEMO' })"
            maxlength="40"
          />
          <p v-if="errors.primaryCtaLabel" class="mt-1 text-xs !text-red-500">
            {{ errors.primaryCtaLabel }}
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-2">
        <dot-button :disabled="loading || !meta.valid" class="w-full" @click="save">
          {{ buttonLabel }}
        </dot-button>
        <p v-if="updateError" class="text-center text-sm !text-red-500">{{ updateError }}</p>
        <p v-else-if="submitImageError" class="text-center text-sm !text-yellow-500">
          {{ submitImageError }}
        </p>
        <p v-else-if="!meta.valid" class="text-center text-sm !text-yellow-500">
          {{ $t("manage.customize.validationRequired") }}
        </p>
      </div>
    </div>

    <div class="col-span-2 flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex w-[450px] justify-between">
          <h2 class="text-xl font-medium">{{ $t("manage.customize.success.preview") }}</h2>
          <p class="text-base font-normal !text-text-secondary">{{ $t("manage.customize.success.previewHint") }}</p>
        </div>
      </div>

      <div class="flex justify-center rounded-[32px] bg-black/5 p-8">
        <div class="w-full max-w-xl rounded-[28px] border border-border-default bg-surface-white p-6 shadow-2xl">
          <ClaimSuccessModalContent
            :sn="previewItemId"
            :collection="drop.id"
            :chain="drop.chain"
            :memo-name="drop.name"
            :memo-image="drop.image"
            :customization="editedCustomization"
            preview-mode
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import * as zod from "zod";
import type { Memo, MemoCustomize, MemoSuccessModalCustomize } from "~/types/memo";
import ClaimSuccessModalContent from "~/components/claim/ClaimSuccessModalContent.vue";

const props = defineProps<{
  drop: Memo;
  savedCustomize: MemoCustomize;
  loading?: boolean;
  updateError?: string | null;
}>();
const emit = defineEmits<{
  submit: [customize: MemoSuccessModalCustomize];
}>();

const { t } = useI18n();
const successCustomization = computed(() => props.savedCustomize?.success ?? {});

const validationSchema = toTypedSchema(
  zod.object({
    image: zod.string().trim().optional(),
    title: zod
      .string()
      .trim()
      .max(80, { message: t("manage.customize.success.titleTooLong") })
      .optional(),
    description: zod
      .string()
      .trim()
      .max(300, { message: t("manage.customize.success.descriptionTooLong") })
      .optional(),
    shareHeading: zod
      .string()
      .trim()
      .max(80, { message: t("manage.customize.success.shareHeadingTooLong") })
      .optional(),
    primaryCtaLabel: zod
      .string()
      .trim()
      .max(40, { message: t("manage.customize.success.primaryCtaTooLong") })
      .optional(),
  }),
);

function getFormValues(customize: MemoSuccessModalCustomize) {
  return {
    image: customize.image ?? undefined,
    title: customize.title ?? "",
    description: customize.description ?? "",
    shareHeading: customize.shareHeading ?? "",
    primaryCtaLabel: customize.primaryCtaLabel ?? "",
  };
}

const { errors, meta, resetForm } = useForm({
  validationSchema,
  initialValues: getFormValues(successCustomization.value),
});

const successCustomizationKey = computed(() => JSON.stringify(getFormValues(successCustomization.value)));

const { value: title } = useField<string>("title");
const { value: description } = useField<string>("description");
const { value: shareHeading } = useField<string>("shareHeading");
const { value: primaryCtaLabel } = useField<string>("primaryCtaLabel");

const {
  image,
  imageError,
  isCustomImage,
  customImageFile,
  uploaderPreviewSrc,
  submitImageError,
  resetImageState,
  markSubmitAttempted,
} = useCustomizeImageUpload({
  initialImage: successCustomization.value.image,
  requiredMessage: t("manage.customize.customPreviewImageRequired"),
  tooLargeMessage: t("manage.customize.customPreviewImageTooLarge"),
  processingFailedMessage: t("manage.customize.customPreviewImageProcessingFailed"),
  errorLogLabel: "success modal image",
});
const previewItemId = "123";

const buildSuccessCustomize = (): MemoSuccessModalCustomize => ({
  image: isCustomImage.value ? image.value || undefined : undefined,
  title: title.value || undefined,
  description: description.value || undefined,
  shareHeading: shareHeading.value || undefined,
  primaryCtaLabel: primaryCtaLabel.value || undefined,
});

const editedCustomization = computed<MemoCustomize>(() => {
  return {
    ...props.savedCustomize,
    success: buildSuccessCustomize(),
  };
});

const buttonLabel = computed(() => {
  if (props.loading) {
    return t("common.saving");
  }

  return t("common.saveChanges");
});

const save = () => {
  markSubmitAttempted();

  if (!meta.value.valid || imageError.value || submitImageError.value) {
    return;
  }

  emit("submit", buildSuccessCustomize());
};

watch(successCustomizationKey, () => {
  const nextSuccessCustomization = successCustomization.value;

  resetForm({
    values: getFormValues(nextSuccessCustomization),
  });
  resetImageState(nextSuccessCustomization.image);
});
</script>
