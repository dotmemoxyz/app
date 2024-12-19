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
            class="pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 rounded-lg bg-white px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
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
      <div class="grid grid-cols-2 gap-8">
        <dot-label :text="t('create.memo.startDate')">
          <dot-text-input v-model="startDate" type="date" :error="startDateError || localStartDateError" />
        </dot-label>
        <dot-label :text="t('create.memo.endDate')">
          <dot-text-input v-model="endDate" type="date" :error="endDateError || localEndDateError" />
        </dot-label>
      </div>
      <dot-label :text="t('create.memo.quantity')">
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
      <dot-label :text="t('create.memo.secret')">
        <dot-text-input v-model="secret" placeholder="event2024" :error="secretError" />
      </dot-label>
      <dot-label vertical :text="t('create.memo.supportEmail')">
        <dot-checkbox v-model="supportEmail" />
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
import SignModal from "~/components/dot/sign-modal.vue";
import { createLogger } from "~~/utils/create-logger";

const { t } = useI18n();
const validationSchema = toTypedSchema(
  zod.object({
    image: zod.instanceof(File).refine((value) => value.size < 5 * 1024 * 1024, {
      message: "Image size must be less than 5MB",
    }),
    name: zod.string({ message: "Name is required" }).min(1, { message: "Name is required" }),
    description: zod.string().optional(),
    externalUrl: zod.string().url({ message: "URL has invalid format" }).optional(),
    startDate: zod.date({ message: "Start date is required" }),
    endDate: zod.date({ message: "End date is required" }),
    quantity: zod.number({ message: "Quantity is required" }).positive({ message: "Quantity must be positive" }),
    secret: zod
      .string({ message: "Secret is required" })
      .min(1, { message: "Secret is required" })
      .regex(/^[a-zA-Z_.\-\d]+$/, "Only alphanumeric characters and '-' are allowed"),
    supportEmail: zod.boolean().optional(),
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
const { value: supportEmail } = useField<boolean>("supportEmail");

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

const onSubmit = handleSubmit(
  ({ description, endDate, image, quantity, startDate, name, externalUrl, secret, supportEmail }) => {
    if (localStartDateError.value || localEndDateError.value) {
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
      supportEmail,
    });

    const { open } = useModal({
      component: SignModal,
      attrs: {
        name,
        startDate,
        endDate,
        quantity,
        image,
        secret,
        description,
        supportEmail,
        chain: preferredChain.value,
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
  },
);

const isSubmittable = computed(
  () =>
    image.value &&
    name.value &&
    startDate.value &&
    endDate.value &&
    secret.value &&
    quantity.value &&
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
