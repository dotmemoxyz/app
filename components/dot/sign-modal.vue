<template>
  <VueFinalModal
    modal-id="sign-modal"
    class="flex items-center justify-center"
    content-class="flex w-[calc(100vw-20px)] sm:w-2/3 md:w-1/2 xl:w-1/4 flex-col max-h-[calc(100vh-40px)] overflow-y-scroll overflow-x-hidden p-6 gap-4 bg-background-color rounded-2xl border border-background-color-inverse"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="flex items-center justify-between pb-1">
      <h1 class="text-xl font-semibold text-text-color">{{ t("create.dialog.confirm") }}</h1>
      <button @click="closeModal()">
        <Icon name="mdi:close" size="32" class="text-text-color" />
      </button>
    </div>

    <hr class="-mx-6" />

    <template v-if="accountStore.hasSelectedAccount">
      <p class="mt-2 text-text-color opacity-70">{{ t("create.dialog.connectedAs") }}</p>

      <div class="flex items-center gap-3">
        <!-- @vue-ignore -->
        <Identicon :size="28" theme="polkadot" :value="currentAccount?.address" />
        <p class="text-text-color">{{ currentAccount?.name }}</p>
      </div>
    </template>

    <client-only v-else>
      <dot-connect />
    </client-only>

    <hr class="my-3" />
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
    <template v-else-if="currencyError">
      <div class="relative rounded border border-red-200 bg-red-100 px-4 py-3 text-red-700" role="alert">
        <strong class="font-bold">{{ t("common.error") }}!</strong>
        <span class="block sm:inline">{{ currencyError }}</span>
      </div>
      <hr class="my-3" />
    </template>

    <template v-if="!isLoading">
      <div class="flex items-center gap-5">
        <div class="flex max-h-20 max-w-20 overflow-hidden rounded-full border-2 border-border-color">
          <img :src="imagePreview" class="flex-1 rounded-full object-cover" />
        </div>
        <div class="flex flex-col gap-2">
          <h1 class="text-xl text-text-color">{{ props.name }}</h1>
          <p class="text-sm text-text-color opacity-70">
            {{
              t("create.dialog.network", {
                name: chainName,
              })
            }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <p class="text-sm text-text-color">{{ t("create.dialog.eventStart") }}</p>
        <p class="text-right text-sm text-text-color/70">{{ props.startDate.toISOString().split("T").at(0) }}</p>
        <p class="text-sm text-text-color">{{ t("create.dialog.eventEnd") }}</p>
        <p class="text-right text-sm text-text-color/70">{{ props.endDate.toISOString().split("T").at(0) }}</p>
        <p class="text-sm text-text-color">{{ t("create.dialog.code") }}</p>
        <span class="flex items-center justify-end gap-2">
          <p
            class="text-sm font-bold text-text-color/70 transition-all"
            :class="{ '[&:not(:hover)]:blur-sm': !displaySecret }"
          >
            {{ props.secret }}
          </p>

          <Icon
            :name="displaySecret ? 'mdi:eye' : 'mdi:eye-off'"
            class="cursor-pointer text-text-color/70"
            @click="displaySecret = !displaySecret"
          />
        </span>
        <p class="text-sm text-text-color">{{ t("create.dialog.amount") }}</p>
        <p class="text-right text-sm font-bold text-text-color/70">{{ props.quantity }}</p>
      </div>

      <hr class="-mx-6 my-3" />

      <div class="grid grid-cols-2 gap-3">
        <p class="text-sm text-text-color">{{ t("create.dialog.total") }}</p>
        <p class="text-right text-sm text-text-color">
          <!-- TODO -->
          <span class="ml-2 font-bold text-text-color/70"> {{ symbolValue }} {{ properties.symbol }} </span>

          <span v-if="dollarValue === null" class="animate-pulse text-xs text-text-color/50">
            ({{ t("common.calculating") }})
          </span>
          <span v-else-if="!currencyError" class="text-xs text-text-color/50"> ({{ dollarValue.toFixed(2) }}$) </span>
        </p>

        <button class="col-span-2 flex items-center gap-2" @click="showBreakdown = !showBreakdown">
          <p class="text-xs text-text-color opacity-50">{{ t("create.dialog.breakdown") }}</p>
          <Icon :name="`mdi:chevron-${showBreakdown ? 'up' : 'down'}`" size="20" class="text-text-color opacity-50" />
        </button>

        <template v-if="showBreakdown">
          <p class="text-sm text-text-color">{{ t("create.dialog.collectionDeposit") }}</p>
          <p class="text-right text-sm text-text-color/70">{{ depositForCollection }} {{ properties.symbol }}</p>
          <p class="text-sm text-text-color">{{ t("create.dialog.freeMintingDeposit") }}</p>
          <p class="text-right text-sm text-text-color/70">
            {{ props.quantity }} x {{ depositPerItem }} {{ properties.symbol }}
          </p>
          <p class="text-sm text-text-color">{{ t("create.dialog.fees") }}</p>
          <p class="text-right text-sm text-text-color/70">0.02 {{ properties.symbol }}</p>
        </template>
      </div>
      <span class="flex w-full items-center justify-between gap-2 rounded-lg border border-black bg-yellow-300 p-4">
        <dot-checkbox v-model="codeWroteDown" black />
        <small class="text-sm text-black">{{ $t("create.dialog.rememberCode") }}</small>
      </span>
      <dot-button
        :disabled="!isLogIn || !!currencyError || isSigning || !codeWroteDown"
        variant="primary"
        size="large"
        @click="sign()"
      >
        {{ isSigning ? `${t("common.signing")} (${statusText})` : t("create.dialog.proceed") }}
      </dot-button>
      <small v-if="status === TransactionStatus.Cancelled" class="text-center text-sm text-gray-400">
        {{ t("create.dialog.canceled") }}
      </small>
    </template>

    <template v-else>
      <div class="flex h-64 flex-row items-center justify-center gap-4 rounded-2xl bg-stone-600/15">
        <svg
          class="animate-spin"
          width="75"
          height="75"
          viewBox="-17.375 -17.375 173.75 173.75"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="stroke-stone-700/20"
            r="59.5"
            cx="69.5"
            cy="69.5"
            fill="transparent"
            stroke-width="11"
            stroke-dasharray="373.66px"
            stroke-dashoffset="0"
          ></circle>
          <circle
            class="stroke-text-color"
            r="59.5"
            cx="69.5"
            cy="69.5"
            stroke-width="16"
            stroke-linecap="round"
            stroke-dashoffset="280px"
            fill="transparent"
            stroke-dasharray="373.66px"
          ></circle>
        </svg>

        <div>
          <p class="text-2xl font-bold text-text-color">{{ t("create.dialog.settingUp") }}</p>
          <p class="text-text-color opacity-70">
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
import { createArgsForNftPallet } from "@/utils/sdk/create";
import useAuth from "~/composables/useAuth";
import { nextCollectionId } from "~/utils/sdk/query";
import { collectionDeposit, itemDeposit, MEMO_BOT, metadataDeposit } from "~/utils/sdk/constants";
import { onApiConnect } from "@kodadot1/sub-api";
import { getChainName } from "~/utils/chain.config";
import { pinFileToIPFS, pinJson, type Metadata } from "~/services/nftStorage";
import Identicon from "@polkadot/vue-identicon";
import { asyncComputed } from "@vueuse/core";
import type { Prefix } from "@kodadot1/static";
import type { SignError } from "~/composables/useMetaTransaction";

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

const { t } = useI18n();

const emit = defineEmits<{
  (e: "success", data: { txHash: string }): void;
  (e: "error", err: SignError): void;
}>();

const chainRef = computed(() => props.chain);

const codeWroteDown = ref(false);

const { apiInstance } = useApi(chainRef);

const {
  howAboutToExecute,
  initTransactionLoader,
  status,
  statusText,
  isError: _isError,
  isLoading,
  error: txError,
} = useMetaTransaction(chainRef);
const { accountId, isLogIn } = useAuth();

const properties = computed(() => chainAssetOf(props.chain));
const chainName = getChainName(props.chain);
const depositPerItem = ref(0);
const depositForCollection = ref(0);
const futureCollection = ref(0);
const totalPayableDeposit = ref(BigInt(0));
const toMint = ref<string | null>(null);
const totalDeposit = computed(() => depositPerItem.value * props.quantity + depositForCollection.value);
const imageCid = ref<string | null>(null);
const txHash = ref<null | string>("");

const displaySecret = ref(false);

const accountStore = useAccountStore();
const currentAccount = computed(() => accountStore.selected);

onApiConnect(props.chain, async (api) => {
  const collectionFee = collectionDeposit(api);
  const itemFee = itemDeposit(api);
  const metadataFee = metadataDeposit(api);
  const decimals = Number(`1e${properties.value.decimals}`);
  depositForCollection.value = (collectionFee + metadataFee) / decimals;
  depositPerItem.value = (itemFee + metadataFee) / decimals;
  totalPayableDeposit.value = BigInt(itemFee + metadataFee) * BigInt(props.quantity);
});

const showBreakdown = ref(false);

const logger = createLogger("SignModal");

async function pinAll() {
  const imageHash = await pinFileToIPFS(props.image);
  const metadata: Metadata = {
    name: props.name,
    image: `ipfs://${imageHash}`,
    banner: `ipfs://${imageHash}`,
    kind: "poap",
    description: props.description || "",
    external_url: "",
    type: props.image.type,
  };
  const metadataHash = await pinJson(metadata);
  return {
    image: `ipfs://${imageHash}`,
    metadata: `ipfs://${metadataHash}`,
  };
}
const signError = ref<string | null>(null);
const isSigning = ref(false);
async function sign() {
  if (!accountId.value) {
    logger.error("No account selected");
    return;
  }
  isSigning.value = true;
  txError.value = null;
  signError.value = null;

  if (!toMint.value) {
    try {
      const { image, metadata } = await pinAll();
      imageCid.value = image;
      toMint.value = metadata;
    } catch (e) {
      logger.error("Failed to pin image and metadata. Reason: %s", (e as Error).message);
      signError.value = "Failed to pin image and metadata. Try again later or contact support.";
      isSigning.value = false;
      return;
    }
  }

  const api = await apiInstance.value;

  const createArgs = createArgsForNftPallet(accountId.value, props.quantity);
  logger.info("Creating collection with args: %O", createArgs);
  const nextId = await nextCollectionId(api);
  if (!nextId) {
    signError.value = "Failed to get next collection id. Try again later or contact support.";
    isSigning.value = false;
    return;
  }

  futureCollection.value = nextId;

  const cb = api.tx.utility.batchAll;
  const args = [
    [
      api.tx.nfts.create(...createArgs),
      api.tx.nfts.setCollectionMetadata(nextId, toMint.value),
      api.tx.nfts.setTeam(nextId, MEMO_BOT, accountId.value, accountId.value),
      // DEV: this does not cover tx fee, we will sponsor it for a whilegs
      api.tx.balances.transferKeepAlive(MEMO_BOT, totalPayableDeposit.value),
      // DEV: this is for tracking purposes
      api.tx.system.remarkWithEvent("dotmemo.xyz"),
    ],
  ];

  initTransactionLoader();
  await howAboutToExecute(accountId.value, cb, args, {
    onSuccess(param) {
      txHash.value = param.txHash;
    },
    onError(err) {
      emit("error", err);
    },
  });
}

watch(txError, (error) => {
  if (error) {
    isSigning.value = false;
  }
});

watch(status, async (status) => {
  // eslint-disable-next-line no-console
  console.log("TransactionStatus", status);
  if (status === TransactionStatus.Cancelled) {
    isSigning.value = false;
  }
  if (status === TransactionStatus.Finalized) {
    try {
      const _data = await $fetch("/api/create", {
        method: "POST",
        body: {
          secret: props.secret,
          chain: props.chain,
          collection: futureCollection.value,
          mint: toMint.value,
          name: props.name,
          image: imageCid.value,
        },
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

const imagePreview = ref("");

onMounted(() => {
  const reader = new FileReader();
  reader.onload = (e) => (imagePreview.value = e.target?.result as string);
  reader.readAsDataURL(props.image);
});

const vfm = useVfm();
const closeModal = () => vfm.close("sign-modal");
const { getPrice, getSymbolName } = usePriceApi();

const symbolValue = computed(() => Math.round(totalDeposit.value * 10000) / 10000);
const currencyError = ref<string | null>(null);
const dollarValue = asyncComputed(async () => {
  try {
    const name = getSymbolName(properties.value.symbol);
    const prices = await getPrice(name);
    if (prices[name]?.usd === undefined) {
      logger.error("Failed to get symbol price. Data: %O", prices);
      currencyError.value = "Failed to fetch currency data. Try again later or contact support.";
      return null;
    }
    return prices[name].usd * symbolValue.value;
  } catch (e) {
    currencyError.value = "Failed to fetch currency data. Try again later or contact support.";
    logger.error("Failed to fetch currency data. Reason: %s", (e as Error).message);
    return null;
  }
}, null);
</script>
