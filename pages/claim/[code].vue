<template>
  <h1 v-if="claimed" class="!dark:text-white my-10 w-full text-center text-4xl text-k-primary">
    {{ t("claim.success") }} 🥳
  </h1>

  <div class="mx-auto mt-10 flex max-w-xl flex-col items-center gap-y-5 p-4 md:mt-24">
    <image-preview :src="data?.image" />

    <h1 v-if="status === 'success' && data" class="text-4xl">{{ data?.name }}</h1>

    <template v-if="error">
      <h3 class="text-k-red">{{ t("claim.cantLoad") }}</h3>
      <dot-button variant="tertiary" @click="router.push('/claim')">{{ t("claim.tryDifferent") }}</dot-button>
    </template>

    <template v-if="status === 'success' && data">
      <div class="flex items-center gap-2">
        <Icon name="mdi:calendar" size="24" class="text-k-primary" />
        <p>
          {{ DateTime.fromSQL(data.createdAt).toLocaleString(DateTime.DATE_FULL) }}
        </p>
        <p>-</p>
        <Icon name="mdi:calendar" size="24" class="text-k-primary" />
        <p>
          {{ DateTime.fromSQL(data.expiresAt).toLocaleString(DateTime.DATE_FULL) }}
        </p>
      </div>
      <div v-if="data.description" class="flex items-center gap-2">
        <Icon name="mdi:text" size="24" class="text-k-primary" />
        <p>
          {{ data.description }}
        </p>
      </div>
      <div class="flex w-full justify-center">
        <small class="text-gray-400 dark:text-white">
          {{
            $t("claim.remaining", {
              free: remaining,
              total: maxMints,
            })
          }}
        </small>
      </div>
    </template>

    <div v-if="!error" class="flex flex-col space-y-3 self-stretch">
      <template v-if="!claimed">
        <template v-if="!allClaimed && !tooLate">
          <div class="mb-6 flex rounded-full border-2 border-border-color p-2 shadow-text-color">
            <button
              class="flex-1 rounded-full py-2 text-text-color"
              :class="{
                'bg-background-color-inverse text-text-color-inverse': showAddressInput,
              }"
              @click="showAddressInput = true"
            >
              {{ t("claim.enterAddress") }}
            </button>
            <button
              class="flex-1 rounded-full py-2 text-text-color"
              :class="{
                'bg-background-color-inverse text-text-color-inverse': !showAddressInput,
              }"
              @click="showAddressInput = false"
            >
              {{ t("claim.connectWallet") }}
            </button>
          </div>

          <dot-label v-if="showAddressInput" :text="t('claim.enterDOTAddress')">
            <form class="flex space-x-4" @submit.prevent="onSubmit()">
              <dot-text-input v-model="manualAddress" :error="addressError" :placeholder="t('common.address')" />
              <div>
                <dot-button variant="tertiary" size="large" @click="open()">
                  <template #icon>
                    <icon name="mdi:qrcode" size="24" />
                  </template>
                </dot-button>
              </div>
            </form>
          </dot-label>

          <client-only v-if="!showAddressInput">
            <dot-label :text="t('common.account')">
              <dot-connect />
            </dot-label>
          </client-only>

          <p v-if="claimFailed" class="w-full text-center !text-red-500">{{ t("claim.alreadyClaimed") }}</p>
        </template>
        <div class="relative flex w-full flex-col gap-2">
          <dot-button
            :disabled="!canClaim || isClaiming || claimFailed"
            variant="primary"
            size="medium"
            class="w-full"
            @click="claim"
          >
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
              class="flex items-center justify-end rounded-full bg-k-primary transition-all duration-[60000ms] ease-linear"
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

        <div v-if="data?.chain && !allClaimed" class="flex w-full items-center justify-center gap-2">
          <small class="text-md dark:text-white">{{ t("claim.claimFree") }} @{{ getChainName(data.chain) }}</small>
          <img :src="`/chain/${data.chain}.webp`" alt="chain" class="max-h-6 max-w-6 rounded-full" />
        </div>
      </template>

      <template v-else>
        <a :href="claimed" class="block w-full">
          <dot-button class="w-full" variant="primary" size="large">
            {{
              t("claim.seeInGallery", {
                name: data?.name ?? "MEMO",
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

const { shareOnTelegram, shareOnX } = useSocials();

const route = useRoute();
const router = useRouter();
const accountStore = useAccountStore();
const manualAddress = ref("");
const showAddressInput = ref(true);

const { t } = useI18n();

watch(showAddressInput, (show) => {
  if (!show) {
    claimFailed.value = false;
  }
});

const address = computed(() => (showAddressInput.value ? manualAddress.value : accountStore.selected?.address));

const addressError = ref("");
watch(address, (address) => {
  claimFailed.value = false;
  if (!address) {
    addressError.value = "Address is required";
    return;
  }
  addressError.value = isValidSubstrateAddress(address ?? "") ? "" : "Invalid address";
});

const canClaim = computed(
  () => address.value && !addressError.value && !isClaiming.value && !allClaimed.value && !tooLate.value,
);

const { data, status, error } = await useFetch("/api/code", {
  query: { code: route.params.code },
  watch: false,
});
// Minting info
const maxMints = ref(0);
const minted = ref(0);
const remaining = ref(0);
const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
const loadingLimitInfo = ref(true);
watch(
  data,
  async (data) => {
    if (data) {
      loadingLimitInfo.value = true;
      const api = await apiInstanceByPrefix(data.chain);
      const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(api, data.collection);
      maxMints.value = maxTokens;
      minted.value = mintedTokens;
      remaining.value = remainingMints;
      loadingLimitInfo.value = false;
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

const allClaimed = computed(() => remaining.value === 0);
const tooLate = computed(() => {
  if (!data.value) return false;
  const serverDate = DateTime.fromSQL(data.value.createdAt).endOf("day");
  const localDate = DateTime.now().startOf("day");
  // Diff only in days, ignore hours, minutes, seconds
  const diff = serverDate.diff(localDate, ["days"]).toObject();
  return diff.days && diff.days < 0;
});

const claimFailed = ref(false);
const claimed = ref<null | string>(null);
const isClaiming = ref(false);

const claimButtonLabel = computed(() => {
  if (loadingLimitInfo.value) return t("claim.loading");
  if (allClaimed.value) return t("claim.allClaimed");
  if (tooLate.value) return t("claim.tooLate");
  if (isClaiming.value) return t("claim.claiming");
  return t("claim.claim");
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

    setTimeout(() => {
      const url = `https://kodadot.xyz/${data.chain}/gallery/${data.collection}-${data.sn}`;
      claimed.value = url;
      isClaiming.value = false;
    }, 60_000);
  } catch (error) {
    claimFailed.value = true;
    isClaiming.value = false;
  }
};
</script>
