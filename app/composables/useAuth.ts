import { FetchError } from "ofetch";
import { useAccountStore } from "@/stores/account";
import type { Challenge, ChallengeExchange, VerifyTokenResponse } from "~/types/auth";

export default function () {
  const accountStore = useAccountStore();

  const accountId = computed(() => accountStore.selected?.address);
  const name = computed(() => accountStore.selected?.name);
  const isLogIn = computed(() => accountStore.hasSelectedAccount);
  const balance = computed(() => 0); // TODO: balance from where?

  const authorize = async () => {
    if (!accountId.value || !accountStore.selected) {
      throw new Error("No account selected");
    }
    const challenge = await $fetch<Challenge>("/api/auth/challenge", {
      method: "POST",
      body: {
        address: accountId.value,
      },
    });

    // Sign the challenge message
    const signRaw = accountStore.selected.wallet.signer?.signRaw;
    if (!signRaw) {
      throw new Error("No signer available");
    }

    const { signature } = await signRaw({
      address: accountId.value,
      data: challenge.message, // or stringToHex(challenge.message) if it needs to be hex
      type: "bytes",
    });

    // Exchange the signature for a token
    const response = await $fetch<ChallengeExchange>("/api/auth/exchange", {
      method: "POST",
      body: {
        challengeId: challenge.challengeId,
        signature,
      },
    });

    // Set token in both store and cookie
    accountStore.setToken(response.token);
    return response.token;
  };

  const verifyToken = async (): Promise<VerifyTokenResponse | null> => {
    try {
      return await $fetch("/api/auth/verify");
    } catch (error) {
      if (error instanceof FetchError && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  };

  const logout = () => {
    // Clear token from store
    accountStore.setToken("");

    // Clear token from cookie
    const accountTokenCookie = useCookie("account-token");
    accountTokenCookie.value = null;
  };

  return {
    accountId,
    name,
    isLogIn,
    balance,
    authorize,
    verifyToken,
    logout,
  };
}
