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
    </form>
  </template>
</template>

<script setup lang="ts">
import type { ClaimType } from "~/types/claim";

defineProps<{
  type: ClaimType;
  addressError: string;
  emailSent: boolean;
  emailError?: string;
  isEmailSending: boolean;
}>();

defineEmits<{
  openQrScanner: [];
  submit: [];
}>();

const { t } = useI18n();

const manualAddress = defineModel<string>("manualAddress", { default: "" });
const emailAddress = defineModel<string>("emailAddress", { default: "" });

const emailFormRef = ref<HTMLFormElement | null>(null);

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
