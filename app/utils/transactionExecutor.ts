/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAddress } from "@/utils/extension";
import { toDefaultAddress } from "@/utils/account";
import type { ISubmittableResult, ISubmittableExtrinsic } from "dedot/types";
import type { PolkadotAssetHubApi } from "@dedot/chaintypes";
import type { Signer } from "@polkadot/api/types";

type DispatchError = PolkadotAssetHubApi["types"]["SpRuntimeDispatchError"];

export interface KeyringPair$Meta {
  [index: string]: any;
}

export interface KeyringAccount {
  address: string;
  meta: KeyringPair$Meta;
  publicKey: string;
  type: string;
}

export type ExecResult = (() => void) | string;
export type StatusCb = (result: ISubmittableResult<DispatchError>) => void | Promise<void>;

export const execResultValue = (execResult: ExecResult): string => {
  if (typeof execResult === "function") {
    execResult();
    return "";
  }
  return execResult;
};

const exec = async <T>(
  account: KeyringAccount | string,
  _password: string | null,
  callback: (...arg: T[]) => ISubmittableExtrinsic<any>,
  params: T[],
  statusCb: StatusCb,
): Promise<ExecResult> => {
  try {
    const tx = callback(...params);
    const address = typeof account === "string" ? account : account.address;
    const injector = await getAddress(toDefaultAddress(address));

    if (!injector?.signer) {
      throw new Error("No signer available");
    }

    const signer: Signer = injector.signer;
    const unsub = await tx.signAndSend(address, { signer }, async (result: ISubmittableResult<DispatchError>) => {
      try {
        await Promise.resolve(statusCb(result));
      } catch (err) {
        console.warn(err);
      } finally {
        if (result.status.type === "Finalized" || result.status.type === "Invalid") {
          unsub();
        }
      }
    });

    return unsub;
  } catch (err) {
    console.warn(err);
    throw err;
  }
};

export type TxCbOnSuccessParams = { blockHash: string; txHash: string; blockNumber: number };

export const txCb =
  (
    onSuccess: (params: TxCbOnSuccessParams) => void,
    onError: (err: DispatchError | Error) => void,
    onResult: (result: ISubmittableResult<DispatchError>) => void = console.log,
  ) =>
  (result: ISubmittableResult<DispatchError>): void => {
    onResult(result);

    if (result.dispatchError) {
      console.warn("[EXEC] dispatchError", result);
      onError(result.dispatchError);
    }

    if (result.status.type === "Finalized") {
      console.log("[EXEC] Finalized", result);
      const { blockHash, blockNumber } = result.status.value;
      console.log(`[EXEC] blockHash ${blockHash}, blockNumber ${blockNumber}`);
      onSuccess({ blockHash, blockNumber, txHash: result.txHash.toString() });
    }
  };

export default exec;
