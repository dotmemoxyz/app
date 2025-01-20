/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ISubmittableResult } from "@polkadot/types/types";
import useAPI from "./useApi";
import useTransactionStatus, { TransactionStatus } from "./useTransactionStatus";
import exec, { execResultValue, txCb } from "@/utils/transactionExecutor";
import type { ExecResult, TxCbOnSuccessParams } from "@/utils/transactionExecutor";
import type { Extrinsic } from "@kodadot1/sub-api";
import type { Prefix } from "@kodadot1/static";
import type { DispatchError } from "@polkadot/types/interfaces";
import camelCase from "lodash/camelCase";

//github.com/dotmemoxyz/app/pull/149

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
  onError?: (err: SignError) => void;
  onResult?: (result: HowAboutToExecuteOnResultParam) => void;
};

export type SignError = {
  level: any;
  title: string;
  message: string;
};

export type HowAboutToExecute = (
  account: string,
  cb: (...params: any[]) => Extrinsic,
  args: any[],
  options?: HowAboutToExecuteOptions,
) => Promise<void>;

export const MODULE_ERRORS_CONFIG: Record<string, { level: string; reportable: boolean }> = {
  NoPermission: {
    level: "danger",
    reportable: true,
  },
  UnknownCollection: {
    level: "danger",
    reportable: false,
  },
  AlreadyExists: {
    level: "danger",
    reportable: true,
  },
  ApprovalExpired: {
    level: "warning",
    reportable: false,
  },
  WrongOwner: {
    level: "danger",
    reportable: true,
  },
  BadWitness: {
    level: "danger",
    reportable: false,
  },
  CollectionIdInUse: {
    level: "danger",
    reportable: false,
  },
  ItemsNonTransferable: {
    level: "danger",
    reportable: false,
  },
  NotDelegate: {
    level: "danger",
    reportable: false,
  },
  WrongDelegate: {
    level: "danger",
    reportable: true,
  },
  Unapproved: {
    level: "danger",
    reportable: false,
  },
  Unaccepted: {
    level: "danger",
    reportable: true,
  },
  ItemLocked: {
    level: "danger",
    reportable: false,
  },
  LockedItemAttributes: {
    level: "danger",
    reportable: false,
  },
  LockedCollectionAttributes: {
    level: "danger",
    reportable: false,
  },
  LockedItemMetadata: {
    level: "danger",
    reportable: false,
  },
  LockedCollectionMetadata: {
    level: "danger",
    reportable: false,
  },
  MaxSupplyReached: {
    level: "warning",
    reportable: false,
  },
  MaxSupplyLocked: {
    level: "warning",
    reportable: false,
  },
  MaxSupplyTooSmall: {
    level: "warning",
    reportable: false,
  },
  UnknownItem: {
    level: "danger",
    reportable: false,
  },
  UnknownSwap: {
    level: "danger",
    reportable: true,
  },
  MetadataNotFound: {
    level: "warning",
    reportable: false,
  },
  AttributeNotFound: {
    level: "danger",
    reportable: true,
  },
  NotForSale: {
    level: "warning",
    reportable: false,
  },
  BidTooLow: {
    level: "danger",
    reportable: false,
  },
  ReachedApprovalLimit: {
    level: "danger",
    reportable: false,
  },
  DeadlineExpired: {
    level: "warning",
    reportable: false,
  },
  WrongDuration: {
    level: "warning",
    reportable: false,
  },
  MethodDisabled: {
    level: "warning",
    reportable: false,
  },
  WrongSetting: {
    level: "warning",
    reportable: false,
  },
  InconsistentItemConfig: {
    level: "warning",
    reportable: true,
  },
  NoConfig: {
    level: "warning",
    reportable: true,
  },
  RolesNotCleared: {
    level: "warning",
    reportable: true,
  },
  MintNotStarted: {
    level: "danger",
    reportable: false,
  },
  MintEnded: {
    level: "danger",
    reportable: false,
  },
  AlreadyClaimed: {
    level: "danger",
    reportable: false,
  },
  IncorrectData: {
    level: "danger",
    reportable: true,
  },
  WrongOrigin: {
    level: "danger",
    reportable: true,
  },
  WrongSignature: {
    level: "danger",
    reportable: true,
  },
  IncorrectMetadata: {
    level: "warning",
    reportable: false,
  },
  MaxAttributesLimitReached: {
    level: "warning",
    reportable: false,
  },
  WrongNamespace: {
    level: "danger",
    reportable: true,
  },
  CollectionNotEmpty: {
    level: "danger",
    reportable: true,
  },
  WitnessRequired: {
    level: "danger",
    reportable: false,
  },
  FundsUnavailable: {
    level: "warning",
    reportable: false,
  },
};

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

  const extractErrorMetadata = async (dispatchError: DispatchError) => {
    const api = await apiInstance.value;
    const { name, docs, section } = api.registry.findMetaError(dispatchError.asModule);

    return {
      key: `${section}.${name}`,
      name,
      description: docs.join(" "),
      section,
    };
  };

  const notifyDispatchError = async (dispatchError: DispatchError): Promise<SignError> => {
    const { $i18n } = useNuxtApp();

    if (!dispatchError.isModule) {
      const dispatchErrorStr = dispatchError.toString();

      try {
        const { token } = JSON.parse(dispatchErrorStr);
        if (token in MODULE_ERRORS_CONFIG) {
          return {
            level: "warning",
            title: $i18n.t(`create.errors.${camelCase(token)}.name`),
            message: $i18n.t(`create.errors.${camelCase(token)}.description`),
          };
        }
        throw new Error(`Unknown key '${token}'`);
      } catch (error) {
        return {
          title: "Error",
          message: dispatchError.toString(),
          level: "warning",
        };
      }
    }

    const { name, description } = await extractErrorMetadata(dispatchError);
    const config = MODULE_ERRORS_CONFIG[name] ?? undefined;

    return {
      ...(config
        ? {
            title: $i18n.t(`create.errors.${camelCase(name)}.name`),
            message: $i18n.t(`create.errors.${camelCase(name)}.description`),
          }
        : { title: name, message: description }),
      level: config?.level,
    };
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

  const errorCb = (onError?: (err: SignError) => void) => (dispatchError: DispatchError) => {
    tx.value && execResultValue(tx.value);
    onTxError(dispatchError);
    isLoading.value = false;
    isError.value = true;
    if (onError) {
      notifyDispatchError(dispatchError).then((e) => {
        onError(e);
      });
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
    await notifyDispatchError(dispatchError);
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
