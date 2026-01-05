import type { Prefix } from "@kodadot1/static";
import type { TimeRange, AnalyticsDashboardResponse, TrackEventResponse } from "~/types/analytics";

export default function useAnalytics(chain: Prefix, memoId: string) {
  const headers = useRequestHeaders(["cookie"]);

  const fetchDashboard = (range: TimeRange) => {
    return $fetch<AnalyticsDashboardResponse>(`/api/analytics/${chain}/${memoId}/dashboard`, {
      query: { range },
      headers,
    });
  };

  const exportCsv = async (range: TimeRange) => {
    const url = `/api/analytics/${chain}/${memoId}/export?range=${range}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `claims-${memoId}-${range}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trackEvent = (eventType: "page_view" | "claim_started", sessionId: string) => {
    return $fetch<TrackEventResponse>(`/api/analytics/${chain}/${memoId}/track`, {
      method: "POST",
      body: { eventType, sessionId },
    });
  };

  return {
    fetchDashboard,
    exportCsv,
    trackEvent,
  };
}
