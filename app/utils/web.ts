export const normalizeUrl = (url: string): string => {
  if (!url.trim()) return "";
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const formatWeb = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch {
    return url;
  }
};

export const parseUsername = (handle: string): string => {
  return handle.replace("@", "");
};

export const normalizeHandle = (val: unknown): string => {
  return typeof val === "string" ? parseUsername(val.trim()) : "";
};

export const getInstagramUrl = (handle: string) => {
  return `https://instagram.com/${parseUsername(handle)}`;
};

export const getTelegramUrl = (handle: string) => {
  return `https://t.me/${parseUsername(handle)}`;
};

export const getXUrl = (handle: string) => {
  return `https://x.com/${parseUsername(handle)}`;
};
