import type { FetchError } from "ofetch";
import { $fetch } from "ofetch";

export type Metadata = {
  name: string;
  description: string;
  image: string;
  banner: string;
  animation_url?: string;
  external_url?: string;
  type: string;
  kind: string;
};

const BASE_URL = "https://ipos.kodadot.workers.dev/";

const nftStorageApi = $fetch.create({
  baseURL: BASE_URL,
});

export type PinningKey = {
  expiry: string;
  token: string;
};

type StorageApiResponse = {
  ok: boolean;
  value: {
    cid: string;
    size: number;
    type: string;
    created: Date;
  };
};
const logger = createLogger("NFT::STORAGE");
export const pinJson = async (object: Metadata) => {
  const { value } = await nftStorageApi<StorageApiResponse>("/pinJson", {
    method: "POST",
    body: object,
  }).catch((error: FetchError) => {
    throw new Error(`[NFT::STORAGE] Unable to PIN JSON for reasons ${error.data}`);
  });
  logger.log("Pin Json");
  return value.cid;
};

export const pinFileToIPFS = async (file: Blob | File): Promise<string> => {
  // DEV: this is woraround for
  // https://github.com/kodadot/workers/issues/318
  const formData = new FormData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData.append("file", file, (file as any).name);

  const { value } = await nftStorageApi<StorageApiResponse>("/pinFile", {
    method: "POST",
    body: formData, // file,
    // headers: {
    //   'Content-Type': file.type || '*/*',
    // },
  }).catch((error: FetchError) => {
    throw new Error(`[NFT::STORAGE] Unable to PIN File for reasons ${error.data}`);
  });
  logger.log("Pin File");
  return value.cid;
};

export const pinDirectory = async (files: File[]): Promise<string> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("file", file, file.name));

  const response = await nftStorageApi("/pinFile", {
    method: "POST",
    body: formData,
  }).catch((error: FetchError) => {
    throw new Error(`[NFT::STORAGE] Unable to PIN Directory for reasons ${error.data}`);
  });

  return response.value.cid;
};

export default nftStorageApi;
