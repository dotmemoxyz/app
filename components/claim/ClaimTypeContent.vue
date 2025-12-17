<template>
  <!-- Claim with address -->
  <form
    v-if="type === 'address'"
    class="flex w-full items-start gap-[12px] rounded-[16px] bg-surface-card p-[12px]"
    @submit.prevent="$emit('submit')"
  >
    <dot-text-input v-model="manualAddress" :error="addressError" :placeholder="t('common.address')" />
    <dot-button variant="tertiary" size="large" @click="$emit('openQrScanner')">
      <template #icon>
        <icon name="mdi:qrcode" size="24" />
      </template>
    </dot-button>
  </form>

  <!-- Claim with wallet -->
  <client-only v-if="type === 'wallet'">
    <div class="flex w-full flex-col gap-[12px] rounded-[16px] bg-surface-card p-[12px]">
      <small class="text-[12px] font-normal text-text-secondary">
        {{ t("common.connectedAccount") }}
      </small>
      <dot-connect long />
    </div>
  </client-only>

  <!-- Claim with email -->
  <template v-if="type === 'email'">
    <div v-if="emailSent" class="flex w-full flex-col items-center gap-[16px] rounded-[16px] bg-surface-card p-[24px]">
      <Icon name="mdi:email-check-outline" size="48" class="text-accent-primary" />
      <p class="text-center text-text-primary">{{ t("claim.checkEmail") }}</p>
    </div>
    <form
      v-else
      ref="emailFormRef"
      class="flex w-full flex-col gap-[12px] rounded-[16px] bg-surface-card p-[12px]"
      @submit.prevent="$emit('submit')"
    >
      <dot-text-input
        v-model="emailAddress"
        type="email"
        required
        :error="emailError"
        :placeholder="t('claim.emailPlaceholder')"
      />

      <!-- Previous email claim notice -->
      <div
        v-if="hasPreviousEmailClaim && previousWalletAddress"
        class="bg-surface-container flex flex-col gap-[12px] rounded-[12px] p-[16px]"
      >
        <div class="flex flex-col gap-[4px]">
          <p class="text-[14px] font-medium text-text-primary">You've used this email before</p>
          <p class="text-[12px] text-text-secondary">
            Previously claimed with wallet
            <code class="mx-[4px] rounded bg-surface-card px-[6px] py-[2px] text-[11px]">{{ truncatedAddress }}</code>
          </p>
        </div>

        <div class="flex items-center justify-between gap-[12px] rounded-[8px] bg-surface-card p-[12px]">
          <div class="flex flex-col gap-[2px]">
            <span class="text-[13px] font-medium text-text-primary">
              {{ usePreviousAddress ? "Claiming with previous wallet" : "Use different wallet" }}
            </span>
            <span class="text-[11px] text-text-secondary">
              {{ usePreviousAddress ? "Toggle off to use a different address" : "Toggle on to use previous wallet" }}
            </span>
          </div>

          <label class="relative inline-flex cursor-pointer items-center">
            <input v-model="usePreviousAddress" type="checkbox" class="peer sr-only" />
            <div
              class="bg-surface-container-high peer h-[24px] w-[44px] rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-[20px] after:w-[20px] after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-[20px] peer-focus:outline-none"
              :style="usePreviousAddress ? { backgroundColor: accentColor } : {}"
            ></div>
          </label>
        </div>

        <dot-text-input
          v-if="usePreviousAddress"
          :model-value="previousWalletAddress"
          :placeholder="t('common.address')"
          disabled
          class="opacity-60"
        />
      </div>
    </form>
  </template>
</template>

<script setup lang="ts">
import type { ClaimType } from "~/types/claim";

const props = defineProps<{
  type: ClaimType;
  addressError: string;
  emailSent: boolean;
  emailError?: string;
  isEmailSending: boolean;
  hasPreviousEmailClaim?: boolean;
  previousWalletAddress?: string;
  accentColor?: string;
}>();

defineEmits<{
  openQrScanner: [];
  submit: [];
}>();

const { t } = useI18n();

const manualAddress = defineModel<string>("manualAddress", { default: "" });
const emailAddress = defineModel<string>("emailAddress", { default: "" });
const usePreviousAddress = defineModel<boolean>("usePreviousAddress", { default: false });

const emailFormRef = ref<HTMLFormElement | null>(null);

const truncatedAddress = computed(() => {
  if (!props.previousWalletAddress) return "";
  return addressShortener(props.previousWalletAddress, 6, -6);
});

const validateEmail = () => {
  if (emailFormRef.value) {
    return emailFormRef.value.reportValidity();
  }
  return true;
};

defineExpose({
  validateEmail,
});
</script>
