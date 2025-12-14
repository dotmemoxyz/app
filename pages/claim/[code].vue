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
              :type="claimType"
              :manual-address="manualAddress"
              :address-error="addressError"
              :email-address="emailAddress"
              :email-error="emailError"
              :is-email-sending="isEmailSending"
              :email-sent="emailSent"
              @update:manual-address="manualAddress = $event"
              @update:email-address="emailAddress = $event"
              @open-qr-scanner="open()"
              @submit="onSubmit()"
              @submit-email="initiateEmail"
            />

            <p v-if="claimFailed && alreadyCollected" class="w-full text-center !text-red-500">
              {{ t("claim.alreadyClaimed") }}
            </p>
            <p v-else-if="claimFailed" class="w-full text-center !text-red-500">{{ t("claim.claimFailed") }}</p>
          </template>

          <ClaimButton
            :disabled="!canClaim || isClaiming || claimFailed"
            :force-color="accentColor"
            :label="claimButtonLabel"
            :is-claiming="isClaiming"
            @click="claim"
          />

          <ClaimChainBadge v-if="data.chain && !allClaimed" :chain="data.chain" />
        </template>

        <ClaimSuccess :claimed-url="claimed" :memo-name="data?.name" :share-message="SHARE_MESSAGE" />
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

const { t } = useI18n();
const route = useRoute();
const accountStore = useAccountStore();

const manualAddress = ref((route.query.address || "") as string);
const claimType = ref<ClaimType>("address");

const emailAddress = ref("");
const emailError = ref("");
const isEmailSending = ref(false);
const emailSent = ref(false);
const addressError = ref("");

watch(claimType, (type) => {
  if (type !== "address") {
    claimFailed.value = false;
  }
});

const address = computed(() => (claimType.value === "address" ? manualAddress.value : accountStore.selected?.address));

watch(address, (address) => {
  claimFailed.value = false;
  if (!address) {
    addressError.value = "Address is required";
    return;
  }
  addressError.value = isValidSubstrateAddress(address ?? "") ? "" : "Invalid address";
});

const canClaim = computed(
  () =>
    address.value &&
    !addressError.value &&
    !isClaiming.value &&
    !allClaimed.value &&
    !tooLate.value &&
    claimType.value !== "email",
);

const initiateEmail = async () => {
  if (!emailAddress.value) return;

  isEmailSending.value = true;
  emailError.value = "";
  try {
    await $fetch("/api/auth/email/initiate", {
      method: "POST",
      body: {
        email: emailAddress.value,
        code: route.params.code,
      },
    });
    emailSent.value = true;
  } catch (err) {
    console.error("Failed to send verification email:", err);
    emailError.value = t("claim.emailError");
  } finally {
    isEmailSending.value = false;
  }
};

const { data, status, error } = await useFetch("/api/code", {
  query: { code: route.params.code },
  watch: false,
});

const { maxMints, remaining, loadingLimitInfo, apiError } = useMintTracking(data);

const allClaimed = computed(() => remaining.value === 0);
const tooLate = computed(() => {
  if (!data.value) return false;
  const serverDate = DateTime.fromISO(data.value.expiresAt).endOf("day");
  const localDate = DateTime.now().startOf("day");
  // Diff only in days, ignore hours, minutes, seconds
  const diff = serverDate.diff(localDate, ["days"]).toObject();
  return diff.days && diff.days < 0;
});

const claimFailed = ref(false);
const alreadyCollected = ref(false);
const claimed = ref<null | string>(null);
const isClaiming = ref(false);

const claimButtonLabel = computed(() => {
  if (loadingLimitInfo.value) return t("claim.loading");
  if (allClaimed.value) return t("claim.allClaimed");
  if (tooLate.value) return t("claim.tooLate");
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

const SHARE_MESSAGE = "I just claimed a new MEMO on dotmemo.xyz! 🎉";

const claim = async () => {
  if (!address.value) return;
  if (!canClaim.value) return;

  try {
    claimFailed.value = false;
    isClaiming.value = true;

    const data = await $fetch("/api/claim", {
      method: "POST",
      body: {
        code: route.params.code,
        address: address.value,
      },
    });
    const url = `https://beta.chaotic.art/${data.chain}/gallery/${data.collection}-${data.sn}`;
    claimed.value = url;
  } catch (error) {
    console.error("Claim failed:", error);
    claimFailed.value = true;
    if (error instanceof FetchError && error.status === 409) {
      alreadyCollected.value = true;
      return;
    }
    console.error("Claim failed:", error);
  } finally {
    isClaiming.value = false;
  }
};

// Customization

const accentColor = computed(() => {
  const color = data.value?.customize?.accentColor;
  if (color) {
    return color;
  }
  return "rgb(85, 243, 154)";
});

const colorMode = useColorMode();
watch(
  () => data.value?.customize?.darkMode,
  (darkMode) => {
    if (darkMode !== undefined) {
      colorMode.value = darkMode ? "dark" : "light";
    }
  },
  {
    immediate: true,
  },
);
</script>
