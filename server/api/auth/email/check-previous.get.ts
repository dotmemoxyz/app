import type { CheckPreviousEmailResponse } from "~/types/email-auth";

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const query = getQuery(event);
  const email = query.email as string;

  if (!email) {
    return {
      hasPreviousClaim: false,
    };
  }

  try {
    const code = query.code as string | undefined;

    const queryParams = new URLSearchParams({ email });

    if (code) {
      queryParams.append("code", code);
    }

    const data = await $fetch<CheckPreviousEmailResponse>(
      `${RUNTIME_CONFIG.apiUrl}/auth/email/check-previous?${queryParams.toString()}`,
    );

    return data;
  } catch (error) {
    console.error("Error checking previous email claim:", error);
    return {
      hasPreviousClaim: false,
    };
  }
});
