export const copy = (str: string) =>
  navigator.clipboard.writeText(str).catch((err) => console.error("Failed to copy text:", err));
