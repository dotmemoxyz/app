import { SelfApp } from "@selfxyz/common";
export interface WebAppInfo {
  appName: string;
  userId: string;
  logoBase64: string;
}
export declare function initWebSocket(
  websocketUrl: string,
  selfApp: SelfApp,
  type: "websocket" | "deeplink",
  setProofStep: (step: number) => void,
  onSuccess: () => void,
  onError: (data: { error_code?: string; reason?: string }) => void,
): () => void;
