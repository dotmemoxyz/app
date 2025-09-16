export const formatWeb = (url: string) => {
  const { hostname } = new URL(url);
  return hostname.replace("www.", "");
};

export const getInstagramUrl = (handle: string) => {
  return `https://instagram.com/${handle.replace("@", "")}`;
};

export const getTelegramUrl = (handle: string) => {
  return `https://t.me/${handle.replace("@", "")}`;
};
