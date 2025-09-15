import { ref, computed, watch, type Ref } from "vue";
import { countries, getUniversalLink } from "@selfxyz/core";
import { SelfAppBuilder, type SelfApp } from "@selfxyz/common";

interface UseSelfOptions {
  appName?: string;
  scope?: string;
  endpoint?: string;
  logoBase64?: string;
  userDefinedData?: string;
  disclosures?: {
    minimumAge?: number;
    ofac?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excludedCountries?: any[];
    name?: boolean;
    issuing_state?: boolean;
    nationality?: boolean;
    date_of_birth?: boolean;
    passport_number?: boolean;
    gender?: boolean;
    expiry_date?: boolean;
  };
}

interface UseSelfReturn {
  selfApp: Ref<SelfApp | null>;
  universalLink: Ref<string>;
  userId: Ref<string>;
  setUserId: (userId: string) => void;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  copyToClipboard: () => Promise<void>;
  openSelfApp: () => void;
  linkCopied: Ref<boolean>;
}

export function useSelf(options: UseSelfOptions = {}): UseSelfReturn {
  const { $config } = useNuxtApp();
  const config = useRuntimeConfig();

  // Reactive state
  const selfApp = ref<SelfApp | null>(null);
  const universalLink = ref("");
  const userId = ref("0x0000000000000000000000000000000000000000");
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const linkCopied = ref(false);

  // Default options
  const defaultOptions: UseSelfOptions = {
    appName: "MEMO Identity Verification",
    scope: config.public.selfScope,
    endpoint: ($config.public.selfEndpoint as string) || "https://api.self.inc",
    logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
    userDefinedData: "MEMO Protocol Verification",
    disclosures: {
      minimumAge: 18,
      ofac: false,
      excludedCountries: [countries.NORTH_KOREA],
      nationality: true,
      gender: true,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Computed property for excluded countries (similar to useMemo)
  const excludedCountries = computed(() => finalOptions.disclosures?.excludedCountries || []);

  // Initialize Self app function
  const initializeSelfApp = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const app = new SelfAppBuilder({
        devMode: true,
        version: 2,
        appName: finalOptions.appName!,
        scope: finalOptions.scope!,
        endpoint: finalOptions.endpoint!,
        logoBase64: finalOptions.logoBase64!,
        userId: userId.value,
        endpointType: "staging_https",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: finalOptions.userDefinedData!,
        disclosures: {
          minimumAge: finalOptions.disclosures?.minimumAge || 18,
          ofac: finalOptions.disclosures?.ofac || false,
          excludedCountries: excludedCountries.value,
          name: finalOptions.disclosures?.name || false,
          issuing_state: finalOptions.disclosures?.issuing_state || false,
          nationality: finalOptions.disclosures?.nationality || true,
          date_of_birth: finalOptions.disclosures?.date_of_birth || false,
          passport_number: finalOptions.disclosures?.passport_number || false,
          gender: finalOptions.disclosures?.gender || true,
          expiry_date: finalOptions.disclosures?.expiry_date || false,
        },
      }).build();

      selfApp.value = app;
      universalLink.value = getUniversalLink(app);
      isLoading.value = false;
    } catch (err) {
      console.error("Failed to initialize Self app:", err);
      error.value = err instanceof Error ? err.message : "Failed to initialize Self app";
      isLoading.value = false;
    }
  };

  // Watch for changes in userId and excludedCountries (similar to useEffect dependencies)
  watch(
    [userId, excludedCountries],
    () => {
      initializeSelfApp();
    },
    { immediate: true },
  );

  const setUserId = (newUserId: string) => {
    userId.value = newUserId;
  };

  const copyToClipboard = async (): Promise<void> => {
    if (!universalLink.value) return;

    try {
      await navigator.clipboard.writeText(universalLink.value);
      linkCopied.value = true;
      setTimeout(() => {
        linkCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      throw new Error("Failed to copy link");
    }
  };

  const openSelfApp = (): void => {
    if (!universalLink.value) return;
    window.open(universalLink.value, "_blank");
  };

  return {
    selfApp,
    universalLink,
    userId,
    setUserId,
    isLoading,
    error,
    copyToClipboard,
    openSelfApp,
    linkCopied,
  };
}
