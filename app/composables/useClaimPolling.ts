import type { ClaimCheckResponse } from "~/types/memo";

export const useClaimPolling = () => {
  const isClaiming = ref(false);
  const claimFailed = ref(false);
  const claimedItemId = ref<string>();

  const startCheckProcess = (claimId: string, itemId: string) => {
    isClaiming.value = true;
    claimFailed.value = false;

    const interval = setInterval(async () => {
      try {
        const checkData = await $fetch<ClaimCheckResponse>("/api/check", {
          query: { id: claimId },
          method: "GET",
        });

        if (checkData.status === "completed") {
          claimedItemId.value = itemId;
          isClaiming.value = false;
          clearInterval(interval);
        } else if (checkData.status === "failed") {
          claimFailed.value = true;
          isClaiming.value = false;
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error during claim status check:", error);
      }
    }, 5000); // Check every 5 seconds
  };

  return {
    isClaiming,
    claimFailed,
    claimedItemId,
    startCheckProcess,
  };
};
