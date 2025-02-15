<template>
  <form class="mx-auto flex max-w-md flex-col space-y-7 px-4 pb-20 pt-8" @submit="onSubmit">
    <h1 class="text-4xl font-extrabold text-text-color">{{ t("create.title") }}</h1>

    <div class="flex flex-col gap-4">
      <dot-image-input v-model="image" :error="imageError" />
      <dot-label :text="t('create.memo.chain')">
        <dot-select v-model="preferredChain" :options="chainList" />
      </dot-label>
      <dot-label :text="t('create.memo.name')">
        <dot-text-input
          v-model="name"
          :limit="150"
          type="text"
          :placeholder="t('create.memo.namePlaceholder')"
          :error="nameError"
        />
      </dot-label>
      <dot-label :text="t('create.memo.description')">
        <dot-text-area
          v-model="description"
          :limit="500"
          :placeholder="t('create.memo.descriptionPlaceholder')"
          :error="descriptionError"
        />
      </dot-label>
      <dot-label class="relative" :text="t('create.memo.website')">
        <div class="group absolute right-0 top-0 cursor-default rounded-full bg-k-primary px-2">
          <span>?</span>
          <span
            class="pointer-events-none absolute bottom-5 right-5 z-50 mt-2 w-64 rounded-lg bg-k-primary px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white"
          >
            {{ t("create.memo.websiteHint") }}
          </span>
        </div>
        <dot-text-input
          v-model="externalUrl"
          :placeholder="t('create.memo.websitePlaceholder')"
          :error="externalUrlError"
        />
      </dot-label>
      <div class="relative grid grid-cols-2 gap-8">
        <div class="group absolute right-0 top-0 cursor-default rounded-full bg-k-primary px-2">
          <span>?</span>
          <span
            class="pointer-events-none absolute bottom-5 right-5 z-50 mt-2 w-64 rounded-lg bg-k-primary px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white"
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
      <dot-label class="relative" :text="t('create.memo.quantity')">
        <div class="group absolute right-0 top-0 cursor-default rounded-full bg-k-primary px-2">
          <span>?</span>
          <span
            class="pointer-events-none absolute bottom-5 right-5 z-50 mt-2 w-64 rounded-lg bg-k-primary px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white"
          >
            {{ t("create.memo.quantityHint") }}
          </span>
        </div>
        <dot-text-input v-model.number="quantity" type="number" placeholder="0" :error="quantityError" />
        <div class="hidden gap-2 md:flex">
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity -= 100"> -100 </dot-button>
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity -= 10"> -10 </dot-button>
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity -= 1"> -1 </dot-button>
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity = 0">0 </dot-button>
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity += 1"> +1 </dot-button>
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity += 10"> +10 </dot-button>
          <dot-button class="flex-1" size="small" variant="tertiary" @click="quantity += 100"> +100 </dot-button>
        </div>
      </dot-label>
      <dot-label class="relative" :text="t('create.memo.secret')">
        <div class="group absolute right-0 top-0 cursor-default rounded-full bg-k-primary px-2">
          <span>?</span>
          <span
            class="pointer-events-none absolute bottom-5 right-5 z-50 mt-2 w-64 rounded-lg bg-k-primary px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:bg-white"
          >
            {{ t("create.memo.secretHint") }}
          </span>
        </div>
        <dot-text-input v-model="secret" placeholder="event2024" :error="secretError || existingCodeError">
          <template #suffix>
            <Icon v-if="checkingCode" name="mdi:loading" class="animate-spin" size="24" />
          </template>
        </dot-text-input>
      </dot-label>
    </div>
    <dot-button :disabled="!isSubmittable" size="large" submit variant="primary" class="w-full"> Create </dot-button>
  </form>
</template>

<script lang="ts" setup>
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useModal } from "vue-final-modal";
import * as zod from "zod";
import type { Option } from "~/types/components";
import SuccessModal from "~/components/modals/success-modal.vue";
import SignModal from "~/components/modals/sign-modal.vue";
import { debouncedWatch } from "@vueuse/core";
import SignErrorModal from "~/components/modals/sign-error-modal.vue";

const { t } = useI18n();
const validationSchema = toTypedSchema(
  zod.object({
    image: zod.instanceof(File).refine((value) => value.size < 5 * 1024 * 1024, {
      message: "Image size must be less than 5MB",
    }),
    name: zod.string({ message: "Name is required" }).min(1, { message: "Name is required" }),
    description: zod.string().optional(),
    externalUrl: zod
      .string()
      .url({ message: "URL has invalid format" })
      .optional()
      .or(zod.literal("").transform(() => undefined)),
    startDate: zod.date({ message: "Start date is required" }),
    endDate: zod.date({ message: "End date is required" }),
    quantity: zod.number({ message: "Quantity is required" }).positive({ message: "Quantity must be positive" }),
    secret: zod
      .string({ message: "Secret is required" })
      .min(5, { message: "Must be at least 5 characters" })
      .regex(/^[a-z_.\-\d]+$/, "Please use only lowercase letters, numbers, and these symbols: '-', '_', or '.'"),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    quantity: 1,
  },
});

const { value: image, errorMessage: imageError } = useField<File>("image");
const { value: name, errorMessage: nameError } = useField<string>("name");
const { value: description, errorMessage: descriptionError } = useField<string>("description");
const { value: externalUrl, errorMessage: externalUrlError } = useField<string>("externalUrl");
const { value: startDate, errorMessage: startDateError } = useField<Date>("startDate");
const localStartDateError = ref<string>("");
const { value: endDate, errorMessage: endDateError } = useField<Date>("endDate");
const localEndDateError = ref<string>("");
const { value: quantity, errorMessage: quantityError } = useField<number>("quantity");
const { value: secret, errorMessage: secretError } = useField<string>("secret");

const {
  status,
  refresh,
  error: loadCodeError,
} = await useFetch("/api/code", {
  query: { code: secret },
  immediate: false,
  watch: false,
});

const existingCodeError = ref("");
const checkingCode = ref(false);

watch(secret, () => {
  checkingCode.value = true;
});

debouncedWatch(
  secret,
  async () => {
    await refresh();
    if (loadCodeError.value && loadCodeError.value.statusCode !== 404) {
      existingCodeError.value = "Checking existence error!";
    } else if (status.value === "success") {
      existingCodeError.value = "Code already exists!";
    } else {
      existingCodeError.value = "";
    }
    checkingCode.value = false;
  },
  {
    debounce: 500,
  },
);

// As `refine` doesnt work with `toTypedSchema` we need to do this manually
watch([startDate, endDate], ([startDate, endDate]) => {
  if (startDate > endDate) {
    localStartDateError.value = "Start date must be before end date";
    localEndDateError.value = "End date must be after start date";
  } else {
    localStartDateError.value = "";
    localEndDateError.value = "";
  }
});

const logger = createLogger("CreatePage");

const onSubmit = handleSubmit(({ description, endDate, image, quantity, startDate, name, externalUrl, secret }) => {
  if (localStartDateError.value || localEndDateError.value || existingCodeError.value) {
    return;
  }

  logger.success({
    description,
    endDate,
    quantity,
    startDate,
    image,
    name,
    externalUrl,
  });

  const { open, close: closeSignModal } = useModal({
    component: SignModal,
    attrs: {
      name,
      startDate,
      endDate,
      quantity,
      image,
      secret,
      description,
      chain: preferredChain.value,
      onError(err) {
        closeSignModal();
        const { open: openErrorModal } = useModal({
          component: SignErrorModal,
          attrs: {
            signError: err,
          },
        });

        openErrorModal();
      },
      onSuccess({ txHash }) {
        const { open: openSuccessModal } = useModal({
          component: SuccessModal,
          attrs: {
            chain: preferredChain.value,
            quantity,
            name,
            secret,
            image,
            tx: txHash,
          },
        });

        openSuccessModal();
      },
    },
  });

  open();

  return;
});

const isSubmittable = computed(
  () =>
    image.value &&
    name.value &&
    startDate.value &&
    endDate.value &&
    secret.value &&
    quantity.value &&
    !checkingCode.value &&
    !existingCodeError.value &&
    !localStartDateError.value &&
    !localEndDateError.value &&
    !Object.keys(errors.value).length,
);

// Chain list
const { prefix } = usePrefix();
const preferredChain = ref(prefix.value);

const chainList = computed<Option[]>(() => [
  { text: "Asset Hub Kusama", value: "ahk", info: "Kusama is a canary network for Polkadot." },
  { text: "Asset Hub Polkadot", value: "ahp", info: "Polkadot is a multi-chain network." },
]);
</script>

<style>
input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-calendar-picker-indicator {
  /* https://gist.github.com/evilmarty/3021338 */
  filter: invert(60%) sepia(100%) saturate(1854%) hue-rotate(100deg) brightness(80%) contrast(106%);
}
</style>
