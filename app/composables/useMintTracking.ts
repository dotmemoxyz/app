import type { Ref } from "vue";
import type { Prefix } from "@kodadot1/static";
import { getFreeMints } from "~/utils/sdk/query";
import type { Memo } from "~/types/memo";

type MintData = Pick<Memo, "chain" | "reservedCount"> & {
  collectionId?: string;
  id?: string;
};

export const useMintTracking = (data: Ref<MintData | null | undefined>) => {
  const maxMints = ref<number | null>(0);
  const minted = ref(0);
  const remaining = ref<number | null>(0);
  const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
  const loadingLimitInfo = ref(true);
  const apiError = ref<string | null>(null);

  watch(
    data,
    async (data) => {
      if (data) {
        loadingLimitInfo.value = true;
        try {
          const client = await apiInstanceByPrefix(data.chain as Prefix);
          const collectionId = data.id || data.collectionId;
          if (!collectionId) {
            throw new Error("No collection ID provided");
          }
          const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(client, Number(collectionId));
          maxMints.value = maxTokens;
          minted.value = mintedTokens;

          // Subtract email reservations from remaining mints
          const reservedCount = data.reservedCount ?? 0;
          const actualRemaining = Math.max(0, (remainingMints ?? 0) - reservedCount);
          remaining.value = actualRemaining;

          loadingLimitInfo.value = false;
        } catch (error) {
          console.error("Error fetching minting limits:", error);
          apiError.value = "Failed to load minting limits. Please try again later.";
          loadingLimitInfo.value = false;
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  return {
    maxMints,
    minted,
    remaining,
    loadingLimitInfo,
    apiError,
  };
};
