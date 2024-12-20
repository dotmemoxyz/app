/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toDefaultAddress } from "@/utils/account";
import { getAddress } from "@/utils/extension";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import type { HexString, Transaction, TxFinalizedPayload, TxEntry } from "polkadot-api";
import { MEMO_BOT } from "./sdk/constants";

export interface KeyringPair$Meta {
  [index: string]: any;
}

export interface KeyringAccount {
  address: string;
  meta: KeyringPair$Meta;
  publicKey: string;
  type: string;
}

export type ExecResult = TxFinalizedPayload | string;
export type UnsubscribeFn = () => string;

// eslint-disable-next-line @typescript-eslint/ban-types
export type ExtrinsicFunction<T extends {} | undefined, Asset> = (
  ...args: T extends undefined ? [] : [data: T]
) => Transaction<T, string, string, Asset>;
export type StatusCb = <T extends TxFinalizedPayload>(result: T) => void | Promise<void>;
export type ISubmittableResult = TxFinalizedPayload;

// export const execResultValue = (execResult: ExecResult): string => {
//   if (typeof execResult === "function") {
//     return execResult();
//   }

//   return execResult;
// };

// eslint-disable-next-line @typescript-eslint/ban-types
const exec = async <T extends {} | undefined, Asset>(
  account: KeyringAccount | string,
  _password: string | null,
  callback: ExtrinsicFunction<T, Asset>,
  params: T extends undefined ? [] : [data: T],
  statusCb: Callback,
): Promise<ExecResult> => {
  try {
    const call = callback(...params);
    const address = typeof account === "string" ? account : account.address;
    const injector = await getAddress(toDefaultAddress(address));
    const hasCallback = typeof statusCb === "function";
    const accountDetail = injector?.getAccounts().find((acc) => acc.address === address);
    // const options = accountDetail ? { signer: accountDetail.polkadotSigner } : undefined;
    if (!accountDetail) {
      throw new Error("Account not found");
    }
    //TODO: Incompatible signer with polkadot-js
    const tx = call.signAndSubmit(accountDetail.polkadotSigner);
    const hash = await getHash(hasCallback, tx, statusCb);
    return hash;
  } catch (err) {
    console.warn(err);
    throw err;
  }
};

const getHash = async (hasCallback: boolean, tx: Promise<TxFinalizedPayload>, statusCb: StatusCb) => {
  return hasCallback
    ? tx.then((result) => {
        statusCb(result);
        return result;
      })
    : await tx;
};

// const constructCallback = (cb: () => void, result: string) => {
//   return () => {
//     cb();
//     return result;
//   };
// };

export type TxCbOnSuccessParams = { blockHash: HexString; txHash: HexString };

export const txCb =
  <T extends TxFinalizedPayload>(
    onSuccess: (prams: TxCbOnSuccessParams) => void,
    onError: (err: any) => void,
    onResult: (result: T) => void = console.log,
  ) =>
  (result: T): void => {
    onResult(result);
    if (result.dispatchError || !result.ok) {
      console.warn("[EXEC] dispatchError", result);
      onError(result.dispatchError);
    }

    if (result.ok) {
      console.log("[EXEC] Finalized", result);
      console.log(`[EXEC] blockHash ${result.block.hash}`);
      onSuccess({ blockHash: result.block.hash, txHash: result.txHash });
    }
  };

type Callback = ReturnType<typeof txCb>;

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
