<template>
  <VueFinalModal
    modal-id="sign-modal"
    class="flex items-center justify-center"
    content-class="flex w-[calc(100vw-20px)] sm:w-2/3 md:w-1/2 xl:w-1/4 flex-col max-h-[calc(100vh-40px)] overflow-y-scroll overflow-x-hidden p-6 gap-4 bg-surface-white rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <!-- Modal header -->
    <div class="flex items-center justify-between pb-1">
      <h1 class="text-xl font-semibold text-text-primary">{{ t("create.dialog.confirm") }}</h1>
      <button @click="closeModal()">
        <Icon name="mdi:close" size="32" class="text-text-primary" />
      </button>
    </div>

    <hr class="-mx-6" />
    <!-- User Account -->
    <template v-if="accountStore.hasSelectedAccount">
      <p class="mt-2 text-text-primary opacity-70">{{ t("create.dialog.connectedAs") }}</p>

      <div class="flex items-center gap-3">
        <!-- @vue-ignore -->
        <Identicon :size="28" theme="polkadot" :value="currentAccount?.address" />
        <p class="text-text-primary">{{ currentAccount?.name }}</p>
      </div>
    </template>
    <client-only v-else>
      <dot-connect />
    </client-only>

    <hr class="my-3" />
    <!-- Display errors -->
    <template v-if="signError">
      <div class="relative rounded border border-red-200 bg-red-100 px-4 py-3 text-red-700" role="alert">
        <strong class="font-bold">{{ t("common.error") }}!</strong>
        <span class="block sm:inline">{{ signError }}</span>
      </div>
      <hr class="my-3" />
    </template>
    <template v-else-if="txError">
      <div class="relative rounded border border-red-200 bg-red-100 px-4 py-3 text-red-700" role="alert">
        <strong class="font-bold">{{ t("common.error") }}!</strong>
        <span class="block sm:inline">{{ txError }}</span>
      </div>
      <hr class="my-3" />
    </template>
    <template v-else-if="priceError">
      <div class="relative rounded border border-red-200 bg-red-100 px-4 py-3 text-red-700" role="alert">
        <strong class="font-bold">{{ t("common.error") }}!</strong>
        <span class="block sm:inline">{{ priceError }}</span>
      </div>
      <hr class="my-3" />
    </template>
    <!-- Signing process -->
    <template v-if="!isLoading">
      <signing-detail
        :name="props.name"
        :image="props.image"
        :start-date="props.startDate"
        :end-date="props.endDate"
        :quantity="props.quantity"
        :secret="props.secret"
        :description="props.description"
        :chain="props.chain"
        :symbol-value="symbolValue"
        :dollar-value="dollarValue"
        :price-loading="priceLoading || loadingApi"
        :price-error="priceError"
        :deposit-per-item="depositPerItem"
        :deposit-for-collection="depositForCollection"
      />
      <span class="flex w-full items-center justify-between gap-2 rounded-lg border border-black bg-yellow-300 p-4">
        <dot-checkbox v-model="codeWroteDown" black />
        <small class="text-sm text-black">{{ $t("create.dialog.rememberCode") }}</small>
      </span>
      <dot-button
        :disabled="!canSign"
        variant="primary"
        size="large"
        @click="sign(image, props.name, props.quantity, props.description)"
      >
        {{ isSigning ? `${t("common.signing")} (${statusText})` : t("create.dialog.proceed") }}
      </dot-button>
      <small v-if="status === TransactionStatus.Cancelled" class="text-center text-sm text-gray-400">
        {{ t("create.dialog.canceled") }}
      </small>
    </template>
    <!-- Signing loading -->
    <template v-else>
      <div class="flex h-64 flex-row items-center justify-center gap-4 rounded-2xl bg-stone-600/15">
        <signing-loader />
        <div>
          <p class="text-2xl font-bold text-text-primary">{{ t("create.dialog.settingUp") }}</p>
          <p class="text-text-primary opacity-70">
            {{
              t("create.dialog.txProgress", {
                status: statusText,
              })
            }}
          </p>
        </div>
      </div>
    </template>
  </VueFinalModal>
</template>

<script lang="ts" setup>
import { VueFinalModal, useVfm } from "vue-final-modal";
import { useAccountStore } from "@/stores/account";
import useAuth from "~/composables/useAuth";
import { collectionDeposit, itemDeposit, metadataDeposit } from "~/utils/sdk/constants";
import { onClientConnect } from "@/utils/dedot/client";
import { getChainEndpointByPrefix } from "@/utils/chain";
import Identicon from "@polkadot/vue-identicon";
import type { Prefix } from "@kodadot1/static";
import { useMemoSign } from "~/composables/useMemoSign";
import type { CreateMemoDTO } from "~/types/memo";
import { DateTime } from "luxon";

const { t } = useI18n();
const logger = createLogger("SignModal");

const props = defineProps<{
  name: string;
  image: File;
  startDate: Date;
  endDate: Date;
  quantity: number;
  secret: string;
  description?: string;
  chain: Prefix;
}>();

const emit = defineEmits<{
  (e: "success", data: { txHash: string }): void;
  (e: "error", err: SignError): void;
}>();

// Modal ref
const vfm = useVfm();
const closeModal = () => vfm.close("sign-modal");

// Current user account
const accountStore = useAccountStore();
const currentAccount = computed(() => accountStore.selected);

// Remember code check
const codeWroteDown = ref(false);

// Chain properties
const chainRef = computed(() => props.chain);
const properties = computed(() => chainAssetOf(props.chain));
const depositPerItem = ref(0);
const depositForCollection = ref(0);
const totalPayableDeposit = ref(BigInt(0));
const loadingApi = ref(true);

// Hook to load chain data
onClientConnect(getChainEndpointByPrefix(props.chain), (client) => {
  const collectionFee = collectionDeposit(client);
  const itemFee = itemDeposit(client);
  const metadataFee = metadataDeposit(client);
  const decimals = Number(`1e${properties.value.decimals}`);
  depositForCollection.value = (collectionFee + metadataFee) / decimals;
  depositPerItem.value = (itemFee + metadataFee) / decimals;
  totalPayableDeposit.value = BigInt(itemFee + metadataFee) * BigInt(props.quantity);
  loadingApi.value = false;
});

// Transaction composables
const { apiInstance } = useApi(chainRef);
const { accountId, isLogIn } = useAuth();
const {
  sign,
  status,
  statusText,
  isLoading,
  error: txError,
  isSigning,
  signError,
  futureCollection,
  toMint,
  imageCid,
  txHash,
} = useMemoSign(chainRef, apiInstance, totalPayableDeposit, accountId, (err) => emit("error", err));

// Handle transaction status
watch(status, async (status) => {
  logger.info("TransactionStatus", status);
  if (status === TransactionStatus.Cancelled) {
    isSigning.value = false;
  }
  // Save transaction data
  if (status === TransactionStatus.Finalized && !signError.value && !txError.value) {
    try {
      await $fetch("/api/create", {
        method: "POST",
        body: {
          secret: props.secret,
          chain: props.chain,
          collection: futureCollection.value,
          mint: toMint.value,
          name: props.name,
          image: imageCid.value,
          expiresAt: DateTime.fromJSDate(props.endDate).toSQL(),
          createdAt: DateTime.fromJSDate(props.startDate).toSQL(),
          creator: accountId.value,
        } as CreateMemoDTO,
      });
    } catch (error) {
      logger.error(error);
    } finally {
      isSigning.value = false;
      if (txHash.value) {
        emit("success", {
          txHash: txHash.value,
        });
      }
      closeModal();
    }
  }
});

// Price
const totalDeposit = computed(() => depositPerItem.value * props.quantity + depositForCollection.value);
const { dollarValue, priceError, symbolValue, priceLoading } = usePriceApi(totalDeposit, properties);

const canSign = computed(() => isLogIn.value && !priceError.value && !isSigning.value && codeWroteDown.value);
</script>
