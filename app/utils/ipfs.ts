import { sanitize } from "@kodadot1/minipfs";

export const sanitizeIpfsUrl = (url: string) => {
  if (!url) return url;

  try {
    const { path: maybePathWithProvider } = sanitize(url);
    const ipfsPath = maybePathWithProvider.split("/ipfs/")[1];
    if (!ipfsPath) return url;

    // TODO: update kodadot1/minipfs and replace kodadot ipfs provider with chaotic bucket
    return `https://bucket.chaotic.art/ipfs/${ipfsPath}`;
  } catch {
    return url;
  }
};
