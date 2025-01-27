import type { Prefix } from "@kodadot1/static";
import { createArgsForNftPallet } from "@/utils/sdk/create";
import { nextCollectionId } from "~/utils/sdk/query";
import { MEMO_BOT } from "~/utils/sdk/constants";
import { pinFileToIPFS, pinJson, type Metadata } from "~/services/nftStorage";
import type { ApiPromise } from "@polkadot/api";

const logger = createLogger("useMemoSign");
export const useMemoSign = (
  chainRef: Ref<Prefix>,
  apiInstance: Ref<Promise<ApiPromise>>,
  totalPayableDeposit: Ref<bigint>,
  accountId: Ref<string | undefined>,
  onError?: (err: SignError) => void,
) => {
  const {
    howAboutToExecute,
    initTransactionLoader,
    status,
    statusText,
    isError: _isError,
    isLoading,
    error: txError,
  } = useMetaTransaction(chainRef);
  // Pin IPFS data
  async function pinAll(image: Blob | File, name: string, description?: string) {
    const imageHash = await pinFileToIPFS(image);
    const metadata: Metadata = {
      name: name,
      image: `ipfs://${imageHash}`,
      banner: `ipfs://${imageHash}`,
      kind: "poap",
      description: description || "",
      external_url: "",
      type: image.type,
    };
    const metadataHash = await pinJson(metadata);
    return {
      image: `ipfs://${imageHash}`,
      metadata: `ipfs://${metadataHash}`,
    };
  }

  const signError = ref<string | null>(null);
  const isSigning = ref(false);

  // Handle signing status on error
  watch(txError, (error) => {
    if (error) {
      isSigning.value = false;
    }
  });

  const futureCollection = ref(0);
  const toMint = ref<string | null>(null);
  const imageCid = ref<string | null>(null);
  const txHash = ref<null | string>("");

  // Sign the transaction
  async function sign(newImage: Blob | File, name: string, quantity: number, description?: string) {
    if (!accountId.value) {
      logger.error("No account selected");
      return;
    }
    isSigning.value = true;
    txError.value = null;
    signError.value = null;

    if (!toMint.value) {
      try {
        const { image, metadata } = await pinAll(newImage, name, description);
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

    const createArgs = createArgsForNftPallet(accountId.value, quantity);
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
      onError(error) {
        onError?.(error);
      },
    });
  }

  return {
    pinAll,
    sign,
    status,
    statusText,
    isError: _isError,
    isLoading,
    error: txError,
    isSigning,
    signError,
    futureCollection,
    toMint,
    imageCid,
    txHash,
  };
};
