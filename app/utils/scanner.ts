export const parseClaimString = (str: string): string => {
  // Find last slash
  const lastSlashIndex = str.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return str;
  }
  return str.slice(lastSlashIndex + 1);
};
