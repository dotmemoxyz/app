export type TimeRange = "7d" | "30d" | "90d" | "all";

export interface AnalyticsStatsResponse {
  totalClaims: number;
  totalClaimsTrend: number; // % change vs previous period
  claimRate: number; // claims / page views * 100
  claimRateTrend: number;
  dailyAvg: number;
  dailyAvgTrend: number;
  peakClaims: number;
  peakDate: string; // ISO date of peak
  conversionRate: number; // completed / started * 100
  dataFreshness: string; // ISO timestamp of last data update
}

export interface TrendDataPoint {
  date: string; // ISO date (YYYY-MM-DD)
  claims: number;
}

export interface AnalyticsTrendResponse {
  data: TrendDataPoint[];
  timeRange: TimeRange;
}

export interface HourlyDistributionPoint {
  hour: number; // 0-23
  claims: number;
}

export interface AnalyticsDistributionResponse {
  data: HourlyDistributionPoint[];
  timeRange: TimeRange;
}

export interface FunnelStep {
  step: "page_views" | "started" | "completed";
  label: string;
  value: number;
}

export interface AnalyticsFunnelResponse {
  steps: FunnelStep[];
  conversionRate: number;
  timeRange: TimeRange;
}

export interface LocationData {
  countryCode: string;
  count: number;
  percentage: number;
}

export interface AnalyticsLocationsResponse {
  locations: LocationData[];
  total: number;
  timeRange: TimeRange;
}

export interface TrackEventRequest {
  eventType: "page_view" | "claim_started";
  sessionId: string;
}

export interface TrackEventResponse {
  success: boolean;
}

export interface AnalyticsDashboardResponse {
  stats: AnalyticsStatsResponse;
  trend: AnalyticsTrendResponse;
  distribution: AnalyticsDistributionResponse;
  funnel: AnalyticsFunnelResponse;
  locations: AnalyticsLocationsResponse;
  cachedAt: string;
}
