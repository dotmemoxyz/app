<template>
  <h1 v-if="claimed" class="!dark:text-white my-10 w-full text-center text-4xl text-accent-primary">
    {{ t("claim.success") }} 🥳
  </h1>

  <div class="mx-auto flex max-w-xl flex-col items-center gap-[32px] p-4 md:mt-24">
    <!-- Image -->
    <image-preview :src="props.data.image" />

    <!-- Name & Description -->
    <div class="flex flex-col items-center gap-[24px]">
      <h1 v-if="props.data.name" class="text-[31px] font-medium text-text-primary">
        {{ props.data.customize?.heading || props.data.name }}
      </h1>
      <h2
        v-if="props.data.description || props.data.customize?.subheading"
        class="text-center text-[16px] font-normal !text-text-secondary"
      >
        {{ props.data.customize?.subheading || data.description }}
      </h2>
    </div>

    <!-- Metadata -->
    <div class="flex w-full items-center justify-center rounded-[12px] bg-surface-card p-[16px] md:justify-between">
      <span class="hidden items-center gap-2 md:flex">
        <p class="text-[14px] font-normal !text-text-secondary">
          {{ DateTime.fromSQL(data.createdAt).toLocaleString(DateTime.DATE_MED) }} -
          {{ DateTime.fromSQL(data.expiresAt).toLocaleString(DateTime.DATE_MED) }}
        </p>
        <p class="text-[14px] font-normal !text-text-placeholder">
          {{ DateTime.fromSQL(data.expiresAt).offsetNameShort }}
        </p>
      </span>
      <span class="flex flex-col gap-2 md:hidden">
        <span class="flex gap-2">
          <p class="text-[14px] font-normal !text-text-secondary">
            {{ DateTime.fromSQL(data.createdAt).toLocaleString(DateTime.DATE_MED) }}
          </p>

          <p class="text-[14px] font-normal !text-text-placeholder">
            {{ DateTime.fromSQL(data.expiresAt).offsetNameShort }}
          </p>
        </span>
        <Icon name="mdi:chevron-down" class="self-center text-text-placeholder" size="16" />
        <span class="flex gap-2">
          <p class="text-[14px] font-normal !text-text-secondary">
            {{ DateTime.fromSQL(data.expiresAt).toLocaleString(DateTime.DATE_MED) }}
          </p>
          <p class="text-[14px] font-normal !text-text-placeholder">
            {{ DateTime.fromSQL(data.expiresAt).offsetNameShort }}
          </p>
        </span>
      </span>
      <p class="hidden text-[14px] font-normal !text-text-secondary md:block">
        {{
          $t("claim.remaining", {
            free: remaining,
            total: maxMints,
          })
        }}
      </p>

      <div v-if="apiError" class="flex w-full justify-center">
        <small class="text-red-500 dark:text-white">{{ apiError }}</small>
      </div>
    </div>
    <div class="flex w-full items-center justify-center rounded-[12px] bg-surface-card p-[16px] md:hidden">
      <p class="text-[14px] font-normal !text-text-secondary">
        {{
          $t("claim.remaining", {
            free: remaining,
            total: maxMints,
          })
        }}
      </p>
    </div>
    <!-- Links -->
    <div v-if="hasSocials" class="flex w-full flex-wrap items-center justify-center gap-[12px] rounded-[12px] p-[16px]">
      <!-- Telegram -->
      <a
        v-if="props.data.customize.telegram"
        :href="data.customize.telegram"
        target="_blank"
        class="flex items-center gap-[6px] px-[14px]"
        rel="noopener noreferrer"
      >
        <icon name="mdi:telegram" size="16" class="text-text-primary" />
        <p>@{{ data.customize.telegram!.split("/").pop() }}</p>
      </a>
      <!-- Instagram -->
      <a
        v-if="props.data.customize.instagram"
        :href="data.customize.instagram"
        target="_blank"
        class="flex items-center gap-[6px] px-[14px]"
        rel="noopener noreferrer"
      >
        <icon name="mdi:instagram" size="16" class="text-text-primary" />
        <p>@{{ data.customize.instagram!.split("/").pop() }}</p>
      </a>
      <!-- Website -->
      <a
        v-if="props.data.customize?.website"
        :href="data.customize.website"
        target="_blank"
        class="flex items-center gap-[6px] px-[14px]"
        rel="noopener noreferrer"
      >
        <icon name="mdi:web" size="16" class="text-text-primary" />
        <p>{{ formatWeb(data.customize.website!) }}</p>
      </a>
    </div>
    <!-- Interaction -->
    <div class="flex flex-col space-y-[16px] self-stretch">
      <template v-if="!claimed">
        <template v-if="!allClaimed && !tooLate">
          <!-- Claim select -->
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
          </div>
          <!-- Claim with address -->
          <form
            v-if="claimType === 'address'"
            class="flex w-full items-start gap-[12px] rounded-[16px] bg-surface-card p-[12px]"
          >
            <dot-text-input v-model="manualAddress" :error="addressError" :placeholder="t('common.address')" />
            <dot-button variant="tertiary" size="large" @click="open()">
              <template #icon>
                <icon name="mdi:qrcode" size="24" />
              </template>
            </dot-button>
          </form>
          <!-- Claim with wallet -->
          <client-only v-if="claimType === 'wallet'">
            <div class="flex w-full flex-col gap-[12px] rounded-[16px] bg-surface-card p-[12px]">
              <small class="text-[12px] font-normal text-text-secondary">
                {{ t("common.connectedAccount") }}
              </small>
              <dot-connect long />
            </div>
          </client-only>

          <p v-if="claimFailed" class="w-full text-center !text-red-500">{{ t("claim.alreadyClaimed") }}</p>
        </template>
        <div class="relative flex w-full flex-col gap-2">
          <dot-button variant="primary" :force-color="accentColor" size="medium" class="w-full">
            {{ claimButtonLabel }}
          </dot-button>

          <div
            class="pointer-events-none absolute inset-0 top-0 flex rounded-full p-1 transition-all duration-700"
            :class="{
              'opacity-100': isClaiming,
              'opacity-0': !isClaiming,
            }"
          >
            <div
              class="flex items-center justify-end rounded-full bg-accent-primary transition-all duration-[60000ms] ease-linear"
              :style="`width: ${isClaiming ? '100%' : '17%'};`"
            >
              <Icon name="mdi:chevron-right" class="animate-pulse text-white animate-duration-[1200ms]" size="28" />
              <Icon
                name="mdi:chevron-right"
                class="animate-pulse text-white animate-delay-[400ms] animate-duration-[1200ms]"
                size="28"
              />
              <Icon
                name="mdi:chevron-right"
                class="animate-pulse text-white animate-delay-[800ms] animate-duration-[1200ms]"
                size="28"
              />
            </div>
          </div>
        </div>

        <div v-if="props.data.chain && !allClaimed" class="flex w-full items-center justify-center gap-2">
          <small class="text-md dark:text-white">{{ t("claim.claimFree") }} @{{ getChainName(data.chain) }}</small>
          <img :src="`/chain/${data.chain}.webp`" alt="chain" class="max-h-6 max-w-6 rounded-full" />
        </div>
      </template>

      <template v-else>
        <a :href="claimed" class="block w-full">
          <dot-button class="w-full" variant="primary" size="large">
            {{
              t("claim.seeInGallery", {
                name: props.data.name ?? "MEMO",
              })
            }}
          </dot-button>
        </a>
        <div class="flex w-full flex-col items-center gap-2">
          <small class="dark:text-white">{{ t("claim.wantToShare") }}</small>
          <span class="mb-10 flex gap-2">
            <div class="flex cursor-pointer items-center gap-2" @click="shareOnTelegram(SHARE_MESSAGE, claimed)">
              <div class="overflow-hidden rounded-full border border-white">
                <img src="/socials/telegram.webp" alt="Telegram" class="size-10" />
              </div>
            </div>
            <div class="flex cursor-pointer items-center gap-2" @click="shareOnX(SHARE_MESSAGE, claimed)">
              <div class="overflow-hidden rounded-full border border-white">
                <img src="/socials/x.webp" alt="X" class="size-10" />
              </div>
            </div>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import QRScannerModal from "~/components/modals/qr-scanner-modal.vue";
import { DateTime } from "luxon";
import { useModal } from "vue-final-modal";
import type { Prefix } from "@kodadot1/static";
import { getFreeMints } from "~/utils/sdk/query";
import type { Memo } from "~/types/memo";

const props = defineProps<{
  data: Memo;
}>();

const { shareOnTelegram, shareOnX } = useSocials();

const accountStore = useAccountStore();
const manualAddress = ref("");
const claimType = ref<"wallet" | "address" | "email">("address");

const { t } = useI18n();

watch(claimType, (type) => {
  if (type !== "address") {
    claimFailed.value = false;
  }
});

const address = computed(() => (claimType.value === "address" ? manualAddress.value : accountStore.selected?.address));

const addressError = ref("");
watch(address, (address) => {
  claimFailed.value = false;
  if (!address) {
    addressError.value = "Address is required";
    return;
  }
  addressError.value = isValidSubstrateAddress(address ?? "") ? "" : "Invalid address";
});

const hasSocials = computed(() => {
  const customize = props.data.customize;
  return customize?.telegram || customize?.instagram || customize?.website;
});
// Minting info
const maxMints = ref<number | null>(0);
const minted = ref(0);
const remaining = ref<number | null>(0);
const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
const loadingLimitInfo = ref(true);
const apiError = ref<string | null>(null);
watch(
  props.data,
  async (data) => {
    if (data) {
      loadingLimitInfo.value = true;
      try {
        const api = await apiInstanceByPrefix(data.chain);
        const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(api, data.id);
        maxMints.value = maxTokens;
        minted.value = mintedTokens;
        remaining.value = remainingMints;
        loadingLimitInfo.value = false;
      } catch (error) {
        console.error("Error fetching minting limits:", error);
        apiError.value = "Failed to load minting limits. Please try again later.";
        loadingLimitInfo.value = false;
      }
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

const allClaimed = computed(() => remaining.value === 0);
const tooLate = computed(() => {
  const serverDate = DateTime.fromSQL(props.data.expiresAt).endOf("day");
  const localDate = DateTime.now().startOf("day");
  // Diff only in days, ignore hours, minutes, seconds
  const diff = serverDate.diff(localDate, ["days"]).toObject();
  return diff.days && diff.days < 0;
});

const claimFailed = ref(false);
const claimed = ref<null | string>(null);
const isClaiming = ref(false);

const claimButtonLabel = computed(() => {
  return props.data.customize?.claimText || t("claim.claim");
});

const { open } = useModal({
  component: QRScannerModal,
  attrs: {
    onScan(data: string) {
      manualAddress.value = data;
    },
  },
});

const SHARE_MESSAGE = "I just claimed a new MEMO on dotmemo.xyz! 🎉";

// Customization

const accentColor = computed(() => {
  const color = props.data.customize?.accentColor;
  if (color) {
    return color;
  }
  return "rgb(85, 243, 154)";
});

const colorMode = useColorMode();
watch(
  () => props.data.customize?.darkMode,
  (darkMode) => {
    if (darkMode !== undefined) {
      colorMode.value = darkMode ? "dark" : "light";
    }
  },
  {
    immediate: true,
  },
);

const formatWeb = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch (e) {
    return url;
  }
};
</script>
