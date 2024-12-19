/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DispatchError } from "@polkadot/types/interfaces";
import type { ISubmittableResult } from "@polkadot/types/types";
import useAPI from "./useApi";
import useTransactionStatus, { TransactionStatus } from "./useTransactionStatus";
import exec, { execResultValue, txCb } from "@/utils/transactionExecutor";
import type { ExecResult, TxCbOnSuccessParams } from "@/utils/transactionExecutor";
import type { Extrinsic } from "@kodadot1/sub-api";
import type { Prefix } from "@kodadot1/static";

export type HowAboutToExecuteOnSuccessParam = {
  txHash: string;
  blockNumber: string;
};

export type HowAboutToExecuteOnResultParam = {
  txHash: string;
  result: ISubmittableResult;
};

type HowAboutToExecuteOptions = {
  onSuccess?: (param: HowAboutToExecuteOnSuccessParam) => void;
  onError?: () => void;
  onResult?: (result: HowAboutToExecuteOnResultParam) => void;
};

export type HowAboutToExecute = (
  account: string,
  cb: (...params: any[]) => Extrinsic,
  args: any[],
  options?: HowAboutToExecuteOptions,
) => Promise<void>;

function useMetaTransaction(prefix: Ref<Prefix>) {
  // const { $i18n } = useNuxtApp()
  const { isLoading, resolveStatus, initTransactionLoader, status, stopLoader, statusText } = useTransactionStatus();
  const error = ref<string | null>(null);
  const { apiInstance } = useAPI(prefix);
  const tx = ref<ExecResult>();
  const isError = ref(false);

  const howAboutToExecute: HowAboutToExecute = async (
    account,
    cb,
    args,
    { onSuccess, onError, onResult } = {},
  ): Promise<void> => {
    try {
      tx.value = await exec(account, "", cb, args, txCb(successCb(onSuccess), errorCb(onError), resultCb(onResult)));
    } catch (e) {
      onCatchError(e);
    }
  };

  const successCb =
    (onSuccess?: (param: HowAboutToExecuteOnSuccessParam) => void) =>
    async ({ blockHash, txHash }: TxCbOnSuccessParams) => {
      const api = await apiInstance.value;

      tx.value && execResultValue(tx.value);
      const header = await api.rpc.chain.getHeader(blockHash);
      const blockNumber = header.number.toString();

      if (onSuccess) {
        onSuccess({ txHash: txHash.toString(), blockNumber });
      }

      isLoading.value = false;
      tx.value = undefined;
    };

  const errorCb = (onError?: () => void) => (dispatchError: DispatchError) => {
    tx.value && execResultValue(tx.value);
    onTxError(dispatchError);
    isLoading.value = false;
    isError.value = true;
    if (onError) {
      onError();
    }
  };

  const resultCb = (onResult?: (result: HowAboutToExecuteOnResultParam) => void) => (result: ISubmittableResult) => {
    resolveStatus(result.status);
    onResult?.({ txHash: result.txHash.toString(), result });
  };

  const onCatchError = (e: Error | any) => {
    if (e instanceof Error) {
      const errorMessage = e.message?.toLowerCase() || "";
      const isCancelled = errorMessage.includes("cancelled") || errorMessage.includes("rejected");
      if (isCancelled) {
        // warningMessage($i18n.t('general.tx.cancelled'), { reportable: false })
        console.warn("Transaction cancelled");

        status.value = TransactionStatus.Cancelled;
      } else {
        console.error("onCatchError", e);
        error.value = errorMessage;
        // warningMessage(e.toString())
      }
      isLoading.value = false;
      tx.value = undefined;
    }
  };
  const onTxError = async (dispatchError: DispatchError): Promise<void> => {
    // await notifyDispatchError(dispatchError)
    console.error("notifyDispatchError", dispatchError);
    isLoading.value = false;
    tx.value = undefined;
  };
  return {
    howAboutToExecute,
    onTxError,
    initTransactionLoader,
    status,
    isLoading,
    stopLoader,
    isError,
    error,
    statusText,
  };
}

export default useMetaTransaction;
