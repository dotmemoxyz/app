import type { ExtrinsicStatus } from "@polkadot/types/interfaces";

export enum TransactionStatus {
  Broadcast = "loader.broadcast",
  Casting = "loader.casting",
  Sign = "loader.sign",
  Block = "loader.block",
  Finalized = "loader.finalized",
  Unknown = "",
  IPFS = "loader.ipfs",
  Cancelled = "loader.cancelled",
}

function useTransactionStatus() {
  const status = ref<TransactionStatus>(TransactionStatus.Unknown);
  const isLoading = ref(false);

  const resolveStatus = (extrinsicStatus: ExtrinsicStatus, omitFinalized?: boolean): void => {
    if (extrinsicStatus.isBroadcast) {
      status.value = TransactionStatus.Broadcast;
      return;
    }
    if (extrinsicStatus.isReady) {
      status.value = TransactionStatus.Casting;
      return;
    }

    if (extrinsicStatus.isInBlock) {
      status.value = TransactionStatus.Block;
      return;
    }

    if (extrinsicStatus.isFinalized) {
      status.value = omitFinalized ? TransactionStatus.Unknown : TransactionStatus.Finalized;
      return;
    }

    status.value = TransactionStatus.Unknown;
  };

  const initTransactionLoader = (): void => {
    isLoading.value = true;
    status.value = TransactionStatus.Unknown;
  };

  const stopLoader = (): void => {
    isLoading.value = false;
    status.value = TransactionStatus.Unknown;
  };

  const statusText = computed(() => {
    switch (status.value) {
      case TransactionStatus.Broadcast:
        return "Broadcast";
      case TransactionStatus.Casting:
        return "Casting";
      case TransactionStatus.Block:
        return "In Block";
      case TransactionStatus.Finalized:
        return "Finalized";
      case TransactionStatus.Unknown:
        return "Unknown";
      case TransactionStatus.IPFS:
        return "IPFS";
      case TransactionStatus.Cancelled:
        return "Cancelled";
      default:
        return "";
    }
  });

  return {
    status,
    isLoading,
    resolveStatus,
    initTransactionLoader,
    stopLoader,
    statusText,
  };
}

export default useTransactionStatus;
