<template>
  <!-- Claim with address -->
  <form
    v-if="type === 'address'"
    class="flex w-full items-start gap-[12px] rounded-[16px] bg-surface-card p-[12px]"
    @submit.prevent="$emit('submit')"
  >
    <dot-text-input
      :model-value="manualAddress"
      :error="addressError"
      :placeholder="t('common.address')"
      @update:model-value="(val) => $emit('update:manualAddress', val as string)"
    />
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
      class="flex w-full flex-col gap-[12px] rounded-[16px] bg-surface-card p-[12px]"
      @submit.prevent="$emit('submitEmail')"
    >
      <dot-text-input
        :model-value="emailAddress"
        type="email"
        :error="emailError"
        :placeholder="t('claim.emailPlaceholder')"
        @update:model-value="(val) => $emit('update:emailAddress', val as string)"
      />
      <dot-button type="submit" variant="primary" :disabled="!emailAddress || isEmailSending" class="w-full">
        {{ isEmailSending ? t("common.sending") : t("claim.sendVerification") }}
      </dot-button>
    </form>
  </template>
</template>

<script setup lang="ts">
import type { ClaimType } from "~/types/claim";

const { t } = useI18n();

defineProps<{
  type: ClaimType;
  manualAddress: string;
  addressError: string;
  emailAddress: string;
  emailError: string;
  isEmailSending: boolean;
  emailSent: boolean;
}>();

defineEmits<{
  "update:manualAddress": [value: string];
  "update:emailAddress": [value: string];
  openQrScanner: [];
  submit: [];
  submitEmail: [];
}>();
</script>
