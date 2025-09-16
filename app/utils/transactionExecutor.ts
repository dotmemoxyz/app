/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AddressOrPair, SubmittableExtrinsic } from "@polkadot/api/types";
import type { Callback, ISubmittableResult } from "@polkadot/types/types";
import { getAddress } from "@/utils/extension";
import { toDefaultAddress } from "@/utils/account";
import type { DispatchError, Hash } from "@polkadot/types/interfaces";
import { MEMO_BOT } from "./sdk/constants";
import type { Extrinsic } from "@kodadot1/sub-api";

export interface KeyringPair$Meta {
  [index: string]: any;
}

export interface KeyringAccount {
  address: string;
  meta: KeyringPair$Meta;
  publicKey: string;
  type: string;
}

export type ExecResult = UnsubscribeFn | string;
export type UnsubscribeFn = () => string;
type ExtrinsicFunction<T> = (...arg: T[]) => Extrinsic;
export type StatusCb = (result: ISubmittableResult) => void | Promise<void>;

export const execResultValue = (execResult: ExecResult): string => {
  if (typeof execResult === "function") {
    return execResult();
  }

  return execResult;
};

const exec = async <T>(
  account: KeyringAccount | string,
  password: string | null,
  callback: ExtrinsicFunction<T>,
  params: T[],
  statusCb: Callback<any>,
): Promise<ExecResult> => {
  try {
    const transfer = await callback(...params);
    const address = typeof account === "string" ? account : account.address;
    const injector = await getAddress(toDefaultAddress(address));
    const hasCallback = typeof statusCb === "function";

    const options = injector ? { signer: injector.signer } : undefined;
    const signer: AddressOrPair = address;

    const tx = await transfer.signAsync(signer, options);
    const hash = await getHash(hasCallback, tx, transfer, statusCb);
    return typeof hash === "function" ? constructCallback(hash, tx.hash.toHex()) : hash.toHex();
  } catch (err) {
    console.warn(err);
    throw err;
  }
};

const getHash = async (hasCallback: boolean, tx: Extrinsic, transfer: Extrinsic, statusCb: StatusCb) => {
  return hasCallback ? await tx.send(statusCb) : await transfer.send();
};

const constructCallback = (cb: () => void, result: string) => {
  return () => {
    cb();
    return result;
  };
};

export type TxCbOnSuccessParams = { blockHash: Hash; txHash: Hash };

export const txCb =
  (
    onSuccess: (prams: TxCbOnSuccessParams) => void,
    onError: (err: DispatchError | Error) => void,
    onResult: (result: ISubmittableResult) => void = console.log,
  ) =>
  (result: ISubmittableResult): void => {
    onResult(result);

    if (result.dispatchError) {
      console.warn("[EXEC] dispatchError", result);
      onError(result.dispatchError);
    } else if (result.internalError) {
      console.warn("[EXEC] internalError", result);
      onError(result.internalError);
    }

    if (result.status.isFinalized) {
      console.log("[EXEC] Finalized", result);
      console.log(`[EXEC] blockHash ${result.status.asFinalized}`);
      onSuccess({ blockHash: result.status.asFinalized, txHash: result.txHash });
    }
  };

export const estimate = async (
  account: KeyringAccount | string,
  callback: (...params: any) => SubmittableExtrinsic<"promise">,
  params: any[],
): Promise<string> => {
  const transfer = await callback(...params);
  const address = typeof account === "string" ? (account ?? MEMO_BOT) : account.address;
  // if user have not connect wallet, we provide a mock address to estimate fee
  const injector = await getAddress(toDefaultAddress(address));

  const info = await transfer.paymentInfo(address, injector ? { signer: injector.signer } : {});
  return info.partialFee.toString();
};

export default exec;
