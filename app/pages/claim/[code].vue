<template>
  <ClaimLayout :claimed="!!claimed">
    <ClaimSkeleton v-if="status === 'pending'" />

    <ClaimPreview
      v-else-if="status === 'success' && data && !error"
      :image="data?.image"
      :name="data?.name"
      :description="data?.description"
      :customization="data?.customize"
    />

    <ClaimLoadError v-else-if="error" />

    <template v-if="status === 'success' && data && !error">
      <ClaimMetadata
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

      <!-- Interaction Section -->
      <div class="flex w-full flex-col space-y-[16px] self-stretch">
        <template v-if="!claimed">
          <template v-if="!allClaimed && !tooLate">
            <ClaimTypeSelector v-model="claimType" />

            <ClaimTypeContent
              ref="claimTypeContentRef"
              v-model:manual-address="manualAddress"
              v-model:email-address="emailAddress"
              v-model:use-previous-address="usePreviousAddress"
              :type="claimType"
              :address-error="addressError"
              :email-error="emailError"
              :is-email-sending="isEmailSending"
              :email-sent="emailSent"
              :has-previous-email-claim="hasPreviousEmailClaim"
              :previous-wallet-address="previousWalletAddress"
              :accent-color="accentColor"
              @open-qr-scanner="open()"
              @submit="onSubmit()"
            />

            <p v-if="claimFailed && alreadyCollected" class="w-full text-center !text-red-500">
              {{ t("claim.alreadyClaimed") }}
            </p>
            <p v-else-if="claimFailed" class="w-full text-center !text-red-500">{{ t("claim.claimFailed") }}</p>
          </template>

          <ClaimButton
            :disabled="
              !canClaim || isClaiming || claimFailed || isEmailDisabled || (claimType === 'email' && emailSent)
            "
            :force-color="accentColor"
            :label="claimButtonLabel"
            :show-progress="isClaiming"
            @click="handleClaimClick"
          />

          <ClaimChainBadge v-if="data.chain && !allClaimed" :chain="data.chain" />
        </template>

        <ClaimSuccess :sn="claimedItemId" :collection="data.id" :chain="data.chain" :memo-name="data?.name" />
      </div>
    </template>
  </ClaimLayout>
</template>
<script setup lang="ts">
import QRScannerModal from "~/components/modals/qr-scanner-modal.vue";
import { DateTime } from "luxon";
import { useModal } from "vue-final-modal";
import { FetchError } from "ofetch";
import type { ClaimType } from "~/types/claim";
import type { ClaimCheckResponse, ClaimMemoResponse } from "~/types/memo";

const { t } = useI18n();
const route = useRoute();
const accountStore = useAccountStore();

const manualAddress = ref((route.query.address || "") as string);
const claimType = ref<ClaimType>("address");

const addressError = ref("");
const claimTypeContentRef = ref<{ validateEmail: () => boolean } | null>(null);

const {
  emailAddress,
  emailError,
  isEmailSending,
  emailSent,
  hasPreviousEmailClaim,
  previousWalletAddress,
  usePreviousAddress,
  isCheckingEmail,
  initiateEmail,
} = useEmailClaim(computed(() => route.params.code as string));

watch(claimType, (type) => {
  if (type !== "address") {
    claimFailed.value = false;
  }
});

const address = computed(() => {
  if (claimType.value === "address") {
    return manualAddress.value;
  }
  if (usePreviousAddress.value && previousWalletAddress.value) {
    return previousWalletAddress.value;
  }
  return accountStore.selected?.address;
});

watch(address, (address) => {
  claimFailed.value = false;
  if (!address) {
    addressError.value = "Address is required";
    return;
  }
  addressError.value = isValidSubstrateAddress(address ?? "") ? "" : "Invalid address";
});

const canClaimEmailType = computed(() => emailAddress.value && !emailError.value && !emailSent.value);

const isEmailDisabled = computed(() => isEmailSending.value || isCheckingEmail.value);

const canClaim = computed(
  () =>
    !isClaiming.value &&
    !allClaimed.value &&
    !tooLate.value &&
    (claimType.value === "email"
      ? (usePreviousAddress.value && previousWalletAddress.value && !addressError.value) || canClaimEmailType.value
      : address.value && !addressError.value),
);

const handleInitiateEmail = async () => {
  if (!canClaimEmailType.value || (claimTypeContentRef.value && !claimTypeContentRef.value.validateEmail())) {
    return;
  }
  await initiateEmail();
};

const handleClaimClick = () => {
  if (claimType.value === "email" && !usePreviousAddress.value) {
    handleInitiateEmail();
  } else {
    claim();
  }
};

const { data, status, error } = await useFetch("/api/code", {
  query: { code: route.params.code },
  watch: false,
});

const { accentColor } = useClaimCustomization(computed(() => data.value ?? null));

const { maxMints, remaining, loadingLimitInfo, apiError } = useMintTracking(data);

const sessionId = ref("");

if (import.meta.client) {
  sessionId.value = crypto.randomUUID();
}

const trackAnalyticsEvent = async (chain: string, memoId: string, eventType: "page_view" | "claim_started") => {
  if (!import.meta.client || !sessionId.value) return;
  try {
    await $fetch(`/api/analytics/${chain}/${memoId}/track`, {
      method: "POST",
      body: { eventType, sessionId: sessionId.value },
    });
  } catch {
    // Silently fail
  }
};

watch(
  data,
  (newData) => {
    if (newData && import.meta.client) {
      trackAnalyticsEvent(newData.chain, newData.id, "page_view");
    }
  },
  { immediate: true },
);

const allClaimed = computed(() => remaining.value === 0);
const tooLate = computed(() => {
  if (!data.value) return false;
  const serverDate = DateTime.fromISO(data.value.expiresAt).endOf("day");
  const localDate = DateTime.now().startOf("day");
  // Diff only in days, ignore hours, minutes, seconds
  const diff = serverDate.diff(localDate, ["days"]).toObject();
  return diff.days && diff.days < 0;
});

const { isClaiming, claimFailed, claimedItemId, startCheckProcess } = useClaimPolling();
const alreadyCollected = ref(false);

const claimed = computed(() => Boolean(claimedItemId.value));

const claimButtonLabel = computed(() => {
  if (loadingLimitInfo.value) return t("claim.loading");
  if (allClaimed.value) return t("claim.allClaimed");
  if (tooLate.value) return t("claim.tooLate");

  if (claimType.value === "email") {
    if (isCheckingEmail.value) {
      return t("common.checking");
    }

    if (isEmailSending.value) {
      return t("common.sending");
    }

    if (emailSent.value) {
      return t("claim.emailSent");
    }

    if (usePreviousAddress.value) {
      return data.value?.customize?.claimText || t("claim.claim");
    }

    return t("claim.sendVerification");
  }

  if (isClaiming.value) return t("claim.claiming");
  return data.value?.customize?.claimText || t("claim.claim");
});

const onSubmit = () => claim();

const { open } = useModal({
  component: QRScannerModal,
  attrs: {
    onScan(data: string) {
      manualAddress.value = data;
    },
  },
});

const claim = async () => {
  if (!address.value) return;
  if (!canClaim.value) return;
  if (!data.value) return;

  trackAnalyticsEvent(data.value.chain, data.value.id, "claim_started");

  try {
    claimFailed.value = false;
    isClaiming.value = true;

    const response = await $fetch<ClaimMemoResponse>("/api/claim", {
      method: "POST",
      body: {
        code: route.params.code,
        address: address.value,
      },
    });

    startCheckProcess(response.claimId, response.itemId);
  } catch (error) {
    console.error("Claim failed:", error);
    claimFailed.value = true;
    isClaiming.value = false;
    if (error instanceof FetchError && error.status === 409) {
      alreadyCollected.value = true;
      return;
    }
    console.error("Claim failed:", error);
  }
};
</script>
