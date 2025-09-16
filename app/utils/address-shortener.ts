export const addressShortener = (address: string, startOffset = 4, endOffset = -4) => {
  return `${address.slice(0, startOffset)}...${address.slice(endOffset)}`;
};
