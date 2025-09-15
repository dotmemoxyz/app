import { SelfApp } from "@selfxyz/common";
interface Props {
  selfApp: SelfApp;
  type?: "websocket" | "deeplink";
  websocketUrl?: string;
  size?: number;
  darkMode?: boolean;
}
declare function __VLS_template(): {
  attrs: Partial<{}>;
  slots: {
    PROOF_GENERATED?(_: { resetState: () => number }): any;
    PROOF_GENERATION_FAILED?(_: { resetState: () => number }): any;
    MOBILE_CONNECTED?(_: { resetState: () => number }): any;
    DISCONNECTED?(_: { resetState: () => number }): any;
    PROOF_VERIFIED?(_: { resetState: () => number }): any;
  };
  refs: {};
  rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import("vue").DefineComponent<
  Props,
  {},
  {},
  {},
  {},
  import("vue").ComponentOptionsMixin,
  import("vue").ComponentOptionsMixin,
  {} & {
    success: () => any;
    error: (data: { error_code?: string; reason?: string }) => any;
    "update:proofStep": (proofStep: number) => any;
  },
  string,
  import("vue").PublicProps,
  Readonly<Props> &
    Readonly<{
      onSuccess?: (() => any) | undefined;
      onError?: ((data: { error_code?: string; reason?: string }) => any) | undefined;
      "onUpdate:proofStep"?: ((proofStep: number) => any) | undefined;
    }>,
  {
    type: "websocket" | "deeplink";
    websocketUrl: string;
    size: number;
    darkMode: boolean;
  },
  {},
  {},
  {},
  string,
  import("vue").ComponentProvideOptions,
  false,
  {},
  any
>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
  new (): {
    $slots: S;
  };
};
