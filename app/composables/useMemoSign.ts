import type { Prefix } from "@kodadot1/static";
import { createArgsForNftPallet } from "@/utils/sdk/create";
import { nextCollectionId } from "~/utils/sdk/query";
import { getMemoBotAddress } from "~/utils/sdk/constants";
import { pinFileToIPFS, pinJson, type Metadata } from "~/services/nftStorage";
import type { ChainClient } from "@/utils/dedot/client";

const logger = createLogger("useMemoSign");
export const useMemoSign = (
  chainRef: Ref<Prefix>,
  apiInstance: Ref<Promise<ChainClient>>,
  totalAmount: Ref<bigint>,
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

    let client: ChainClient;
    try {
      client = await apiInstance.value;
    } catch (e) {
      logger.error("Failed to get API instance. Reason: %s", (e as Error).message);
      signError.value = "Failed to get API instance. Try again later or contact support.";
      isSigning.value = false;
      return;
    }

    const createArgs = createArgsForNftPallet(accountId.value, quantity);
    logger.info("Creating collection with args: %O", createArgs);
    let nextId: number | null = null;
    try {
      nextId = await nextCollectionId(client);
    } catch (e) {
      logger.error("Failed to get next collection id. Reason: %s", (e as Error).message);
      signError.value = "Failed to get next collection id. Try again later or contact support.";
      isSigning.value = false;
      return;
    }
    if (nextId === null) {
      signError.value = "Failed to get next collection id. Try again later or contact support.";
      isSigning.value = false;
      return;
    }

    futureCollection.value = nextId;

    const memoBot = getMemoBotAddress();
    const calls = [
      client.tx.nfts.create(...createArgs).call,
      client.tx.nfts.setCollectionMetadata(nextId, toMint.value!).call,
      client.tx.nfts.setTeam(nextId, memoBot, memoBot, accountId.value).call,
      // DEV: this does not cover tx fee, we will sponsor it for a while
      client.tx.balances.transferKeepAlive(memoBot, totalAmount.value).call,
      // DEV: this is for tracking purposes
      client.tx.system.remarkWithEvent("dotmemo.xyz").call,
    ];
    const cb = (txCalls: typeof calls) => client.tx.utility.batchAll(txCalls);
    const args = [calls];

    initTransactionLoader();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await howAboutToExecute(accountId.value, cb as any, args, {
        onSuccess(param) {
          txHash.value = param.txHash;
        },
        onError(error) {
          onError?.(error);
        },
      });
    } catch (e) {
      logger.error("Failed to execute transaction. Reason: %s", (e as Error).message);
      signError.value = "Failed to execute transaction. Try again later or contact support.";
      isSigning.value = false;
      return;
    }
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
