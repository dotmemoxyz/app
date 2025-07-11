import { $fetch } from "ofetch";
import { useAccountStore } from "@/stores/account";
import type { Challenge, ChallengeExchange } from "~/types/auth";

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
    accountStore.setToken(response.token);
    localStorage.setItem("account-token", response.token);
    return response.token;
  };

  const verifyToken = async (token: string) => {
    return await $fetch<boolean>("/api/auth/verify", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return {
    accountId,
    name,
    isLogIn,
    balance,
    authorize,
    verifyToken,
  };
}
