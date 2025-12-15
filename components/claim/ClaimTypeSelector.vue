<template>
  <div class="flex rounded-[18px] bg-surface-card p-[6px]">
    <button
      class="flex-1 rounded-[12px] border-border-default px-[16px] py-[14px] text-text-primary"
      :class="{
        'border bg-surface-white': claimType === 'address',
      }"
      @click="claimType = 'address'"
    >
      {{ t("claim.enterAddress") }}
    </button>
    <button
      class="flex-1 rounded-[12px] border-border-default px-[16px] py-[14px] text-text-primary"
      :class="{
        'border bg-surface-white': claimType === 'wallet',
      }"
      @click="claimType = 'wallet'"
    >
      {{ t("claim.connectWallet") }}
    </button>
    <button
      class="flex-1 rounded-[12px] border-border-default px-[16px] py-[14px] text-text-primary"
      :class="{
        'border bg-surface-white': claimType === 'email',
      }"
      @click="claimType = 'email'"
    >
      {{ t("claim.email") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ClaimType } from "~/types/claim";

const { t } = useI18n();

const claimType = defineModel<ClaimType>({ required: true });
</script>
