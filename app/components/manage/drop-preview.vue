<template>
  <div class="mx-auto flex max-w-xl flex-col items-center gap-[32px] p-4 md:mt-24">
    <ClaimPreview
      :image="props.data.image"
      :name="props.data.name"
      :description="props.data.description"
      :customization="props.data.customize"
    />

    <ClaimMetadata
      :created-at="props.data.createdAt"
      :expires-at="props.data.expiresAt"
      :remaining="remaining"
      :max-mints="maxMints"
      :loading="loadingLimitInfo"
      :error="apiError"
    />

    <ClaimSocialLinks
      :telegram="props.data.customize?.telegram"
      :instagram="props.data.customize?.instagram"
      :website="props.data.customize?.website"
    />

    <div class="flex flex-col space-y-[16px] self-stretch">
      <template v-if="!allClaimed && !tooLate">
        <div class="flex rounded-[18px] bg-surface-card p-[6px]">
          <button
            class="flex-1 rounded-[12px] border border-border-default bg-surface-white px-[16px] py-[14px] text-text-primary"
          >
            {{ t("claim.enterAddress") }}
          </button>
          <button class="flex-1 rounded-[12px] border-border-default px-[16px] py-[14px] text-text-primary">
            {{ t("claim.connectWallet") }}
          </button>
        </div>

        <div class="flex w-full items-start gap-[12px] rounded-[16px] bg-surface-card p-[12px]">
          <dot-text-input :placeholder="t('common.address')" disabled />
          <dot-button variant="tertiary" size="large" disabled>
            <template #icon>
              <icon name="mdi:qrcode" size="24" />
            </template>
          </dot-button>
        </div>

        <ClaimButton :disabled="false" :force-color="accentColor" :label="claimButtonLabel" :show-progress="false" />
      </template>

      <ClaimChainBadge v-if="props.data.chain && !allClaimed" :chain="props.data.chain" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { Memo } from "~/types/memo";

const props = defineProps<{
  data: Memo;
}>();

const { t } = useI18n();

const { maxMints, remaining, loadingLimitInfo, apiError } = useMintTracking(computed(() => props.data));

const { accentColor } = useClaimCustomization(computed(() => props.data));

const allClaimed = computed(() => remaining.value === 0);

const tooLate = computed(() => {
  const serverDate = DateTime.fromISO(props.data.expiresAt).endOf("day");
  const localDate = DateTime.now().startOf("day");
  const diff = serverDate.diff(localDate, ["days"]).toObject();
  return diff.days && diff.days < 0;
});

const claimButtonLabel = computed(() => {
  return props.data.customize?.claimText?.slice(0, 40) || t("claim.claim");
});
</script>
