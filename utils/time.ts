import { DateTime } from "luxon";

export function formatTimeRemaining(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "";

  const expiresAtDate = DateTime.fromISO(expiresAt);
  const now = DateTime.now();
  const diff = expiresAtDate.diff(now, ["days", "hours", "minutes"]);

  if (diff.days >= 1) {
    const days = Math.floor(diff.days);
    return `in ${days} day${days !== 1 ? "s" : ""}`;
  } else if (diff.hours >= 1) {
    const hours = Math.floor(diff.hours);
    return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
  } else if (diff.minutes >= 1) {
    const minutes = Math.floor(diff.minutes);
    return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    return "soon";
  }
}
