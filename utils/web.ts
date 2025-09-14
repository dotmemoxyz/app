export const formatWeb = (url: string) => {
  const { hostname } = new URL(url);
  return hostname.replace("www.", "");
};
