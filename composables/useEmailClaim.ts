import { FetchError } from "ofetch";
import { debounce } from "lodash";
import type { CheckPreviousEmailResponse } from "~/types/email-auth";

export const useEmailClaim = (code: Ref<string>) => {
  const { t } = useI18n();

  const emailAddress = ref("");
  const emailError = ref<string>();
  const isEmailSending = ref(false);
  const emailSent = ref(false);

  const hasPreviousEmailClaim = ref(false);
  const previousWalletAddress = ref<string>();
  const usePreviousAddress = ref(false);
  const isCheckingEmail = ref(false);

  const checkPreviousEmailClaim = async (email: string) => {
    if (!email || isCheckingEmail.value) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    isCheckingEmail.value = true;

    try {
      const result = await $fetch<CheckPreviousEmailResponse>(
        `/api/auth/email/check-previous?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code.value)}`,
      );

      if (result.hasPreviousClaim && result.walletAddress) {
        hasPreviousEmailClaim.value = true;
        previousWalletAddress.value = result.walletAddress;
        usePreviousAddress.value = true;
      }

      if (result.hasClaimedThisMemo) {
        hasPreviousEmailClaim.value = false;
        usePreviousAddress.value = false;
        previousWalletAddress.value = undefined;
        emailError.value = t("claim.emailAlreadyClaimedMemo");
      }
    } catch (error) {
      console.error("Failed to check previous email claim:", error);
    } finally {
      isCheckingEmail.value = false;
    }
  };

  const debouncedCheckPreviousEmail = debounce(checkPreviousEmailClaim, 500);

  const initiateEmail = async () => {
    if (!emailAddress.value || emailError.value || emailSent.value) {
      return;
    }

    isEmailSending.value = true;
    emailError.value = undefined;

    try {
      await $fetch("/api/auth/email/initiate", {
        method: "POST",
        body: {
          email: emailAddress.value,
          code: code.value,
        },
      });
      emailSent.value = true;
    } catch (err) {
      console.error("Failed to send verification email:", err);
      if (err instanceof FetchError && err.data?.message) {
        emailError.value = err.data.message;
      } else {
        emailError.value = t("claim.emailError");
      }
    } finally {
      isEmailSending.value = false;
    }
  };

  watch(emailAddress, (newEmail) => {
    emailError.value = undefined;
    emailSent.value = false;
    hasPreviousEmailClaim.value = false;
    previousWalletAddress.value = undefined;
    usePreviousAddress.value = false;
    debouncedCheckPreviousEmail(newEmail);
  });

  onUnmounted(() => debouncedCheckPreviousEmail.cancel());

  return {
    emailAddress,
    emailError,
    isEmailSending,
    emailSent,
    hasPreviousEmailClaim,
    previousWalletAddress,
    usePreviousAddress,
    isCheckingEmail,
    initiateEmail,
    checkPreviousEmailClaim,
  };
};
