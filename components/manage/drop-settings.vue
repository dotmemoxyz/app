<template>
  <form class="flex max-w-md flex-col space-y-7 px-4 pb-20 pt-8" @submit="onSubmit">
    <h2 class="text-xl font-medium">{{ t("manage.settings.title") }}</h2>
    <div class="relative grid grid-cols-2 gap-8">
      <div class="group absolute right-0 top-0 cursor-default rounded-full bg-accent-primary px-2">
        <span>?</span>
        <span
          class="pointer-events-none absolute bottom-5 right-5 z-50 mt-2 w-64 rounded-lg bg-accent-primary px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white"
        >
          {{ t("create.memo.dateHint") }}
        </span>
      </div>
      <dot-label :text="t('create.memo.startDate')">
        <dot-text-input v-model="startDate" type="date" :error="startDateError || localStartDateError" />
      </dot-label>
      <dot-label :text="t('create.memo.endDate')">
        <dot-text-input v-model="endDate" type="date" :error="endDateError || localEndDateError" />
      </dot-label>
    </div>
    <div class="flex flex-col gap-2">
      <dot-button :disabled="!isSubmittable || loading" size="large" submit variant="tertiary" class="w-full">
        {{ loading ? t("common.saving") : t("manage.settings.updateWindow") }}
      </dot-button>
      <small class="text-center !text-red-500">{{ dateRangeError }}</small>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import * as zod from "zod";
import type { Memo } from "~/types/memo";

const { t } = useI18n();

const props = defineProps<{
  drop: Memo;
}>();

const { value: startDate, errorMessage: startDateError } = useField<Date>("startDate");
const localStartDateError = ref<string>("");
const { value: endDate, errorMessage: endDateError } = useField<Date>("endDate");
const localEndDateError = ref<string>("");

const validationSchema = toTypedSchema(
  zod.object({
    startDate: zod.date({ message: "Start date is required" }),
    endDate: zod.date({ message: "End date is required" }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    startDate: props.drop.createdAt ? new Date(props.drop.createdAt) : undefined,
    endDate: props.drop.expiresAt ? new Date(props.drop.expiresAt) : undefined,
  },
});

const dateRangeError = computed(() =>
  startDate.value <= endDate.value ? undefined : "Start date must be BEFORE the end date",
);

const logger = createLogger("DropSettings");

const isSubmittable = computed(
  () =>
    startDate.value &&
    endDate.value &&
    !localStartDateError.value &&
    !localEndDateError.value &&
    !dateRangeError.value &&
    !Object.keys(errors.value).length,
);

const loading = ref(false);
const router = useRouter();

const onSubmit = handleSubmit(async ({ endDate, startDate }) => {
  if (localStartDateError.value || localEndDateError.value) {
    return;
  }
  try {
    loading.value = true;
    const res = await $fetch(`/api/drop/${props.drop.chain}/${props.drop.id}`, {
      method: "PUT",
      body: {
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
      },
    });

    logger.success("Response from API:", res);
    router.back();
  } catch (e) {
    logger.error("Error submitting form:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<style></style>
