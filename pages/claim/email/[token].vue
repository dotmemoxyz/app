<template>
  <ClaimLayout :claimed="!!claimed">
    <ClaimSkeleton v-if="status === 'pending'" />

    <ClaimLoadError v-else-if="error" />

    <template v-else-if="data">
      <ClaimPreview
        :image="data.memoImage"
        :name="data.memoName"
        :description="data.memoDescription"
        :customization="data.customize"
      >
        <div class="flex items-center gap-2 rounded-full bg-surface-card px-4 py-2">
          <Icon name="mdi:email-outline" size="20" class="text-text-secondary" />
          <span class="text-sm text-text-secondary">{{ data.email }}</span>
        </div>
      </ClaimPreview>

      <div
        class="flex w-full items-center justify-start gap-2 rounded-[12px] border border-orange-500/20 bg-orange-500/5 p-[16px]"
      >
        <Icon name="mdi:clock-alert-outline" size="20" class="text-orange-500" />
        <div class="flex flex-col gap-1">
          <p class="text-sm font-medium text-orange-500">
            Reservation expires {{ formatTimeRemaining(data.expiresAt) }}
          </p>
          <p class="text-xs text-text-secondary">Complete your claim before {{ reservationExpiresAt }}</p>
        </div>
      </div>

      <ClaimMetadata
        v-if="data.expiresAt"
        :created-at="data.createdAt"
        :expires-at="data.expiresAt"
        :remaining="remaining"
        :max-mints="maxMints"
        :loading="loadingLimitInfo"
        :error="apiError"
      />

      <ClaimSocialLinks
        :telegram="data.customize?.telegram"
        :instagram="data.customize?.instagram"
        :website="data.customize?.website"
      />

      <div class="flex w-full flex-col space-y-[16px] self-stretch">
        <template v-if="!claimed">
          <client-only>
            <div v-if="!address" class="flex w-full flex-col gap-[12px] rounded-[16px] bg-surface-card p-[12px]">
              <small class="text-[12px] font-normal text-text-secondary">
                {{ t("claim.connectWalletToClaim") }}
              </small>
              <dot-connect long />
            </div>
            <template #fallback>
              <div class="flex w-full flex-col gap-[12px] rounded-[16px] bg-surface-card p-[12px]">
                <USkeleton class="h-[14px] w-[160px]" />
                <USkeleton class="h-[40px] w-full" />
              </div>
            </template>
          </client-only>

          <p v-if="claimFailed && alreadyCollected" class="w-full text-center !text-red-500">
            {{ t("claim.alreadyClaimed") }}
          </p>
          <p v-else-if="claimFailed" class="w-full text-center !text-red-500">
            {{ t("claim.claimFailed") }}
          </p>

          <ClaimButton
            v-if="address"
            :disabled="!canClaim || isClaiming || claimFailed"
            :force-color="accentColor"
            :label="claimButtonLabel"
            :show-progress="isClaiming"
            @click="finalizeClaim"
          />

          <ClaimChainBadge v-if="data.chain" :chain="data.chain as Prefix" />
        </template>

        <ClaimSuccess :claimed-url="claimed" :memo-name="data.memoName" :share-message="SHARE_MESSAGE" />
      </div>
    </template>
  </ClaimLayout>
</template>

<script setup lang="ts">
import { FetchError } from "ofetch";
import type { Prefix } from "@kodadot1/static";
import type { EmailClaimDetails, FinalizeClaimResponse } from "~/types/email-auth";
import { DateTime } from "luxon";
import { formatTimeRemaining } from "~/utils/time";
import { SHARE_MESSAGE } from "~/constants/messages";

const route = useRoute();
const accountStore = useAccountStore();
const { t } = useI18n();

const token = computed(() => route.params.token as string);

const { data, status, error } = await useLazyFetch<EmailClaimDetails>(`/api/email-claim/${token.value}`);

const address = computed(() => accountStore.selected?.address);

const claimFailed = ref(false);
const alreadyCollected = ref(false);
const claimed = ref<null | string>(null);
const isClaiming = ref(false);

const { maxMints, remaining, loadingLimitInfo, apiError } = useMintTracking(data);

const canClaim = computed(() => address.value && !isClaiming.value);

const claimButtonLabel = computed(() => {
  if (isClaiming.value) return t("claim.claiming");
  return data.value?.customize?.claimText || t("claim.finalizeClaim");
});

const reservationExpiresAt = computed(() => {
  if (!data.value?.expiresAt) return "";
  return DateTime.fromISO(data.value.expiresAt).toLocaleString(DateTime.DATETIME_MED);
});

const finalizeClaim = async () => {
  if (!address.value || !canClaim.value) return;

  try {
    claimFailed.value = false;
    isClaiming.value = true;

    const response = await $fetch<FinalizeClaimResponse>(`/api/email-claim/${token.value}/finalize`, {
      method: "POST",
      body: { address: address.value },
    });

    const url = `https://beta.chaotic.art/${response.chain}/gallery/${response.collection}-${response.sn}`;
    claimed.value = url;
  } catch (err) {
    console.error("Claim failed:", err);
    claimFailed.value = true;
    if (err instanceof FetchError && err.status === 409) {
      alreadyCollected.value = true;
    }
  } finally {
    isClaiming.value = false;
  }
};

const { accentColor } = useClaimCustomization(data);
</script>
