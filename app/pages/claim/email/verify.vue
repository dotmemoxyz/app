<template>
  <div class="mx-auto flex max-w-xl flex-col items-center gap-[32px] p-4 md:mt-24">
    <template v-if="isVerifying">
      <dot-skeleton class="h-[300px] w-[300px] rounded-[16px]" />
      <div class="flex flex-col items-center gap-4">
        <Icon name="mdi:loading" size="48" class="animate-spin text-accent-primary" />
        <p class="text-text-primary">{{ t("claim.verifying") }}</p>
      </div>
    </template>

    <template v-else-if="verificationError">
      <div class="flex flex-col items-center gap-4">
        <Icon name="mdi:alert-circle-outline" size="64" class="text-red-500" />
        <h2 class="text-xl font-medium text-text-primary">{{ t("claim.verificationFailed") }}</h2>
        <p class="text-center text-text-secondary">{{ verificationError }}</p>
        <dot-button variant="tertiary" @click="router.push('/claim')">
          {{ t("claim.tryDifferent") }}
        </dot-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { VerifyEmailResponse } from "~/types/email-auth";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const isVerifying = ref(true);
const verificationError = ref<string | null>(null);

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    verificationError.value = "No verification token provided";
    isVerifying.value = false;
    return;
  }

  try {
    const response = await $fetch<VerifyEmailResponse>("/api/auth/email/verify", {
      method: "POST",
      body: { token },
    });

    await router.push(`/claim/email/${response.claimToken}`);
  } catch (err) {
    console.error("Verification failed:", err);
    verificationError.value = t("claim.verificationExpired");
    isVerifying.value = false;
  }
});
</script>
