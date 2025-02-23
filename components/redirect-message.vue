<template>
  <div v-if="message" class="relative flex h-24 items-center justify-center bg-k-primary md:h-32">
    <h1 class="px-7 text-center text-lg !text-black md:text-2xl">{{ message }}</h1>

    <button class="absolute right-0 top-0 p-5" @click="hideMessage">
      <Icon name="mdi:close" size="32" class="!text-black" />
    </button>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { t } = useI18n();

function hideMessage() {
  useRouter().push({
    query: {
      ...Object.fromEntries(Object.entries(route.query).filter(([key]) => key !== "action")),
    },
  });
}

const message = computed(() => {
  if (route.query.action) {
    if (route.query.action === "verify_email") {
      return t("redirectMessages.verifyEmail");
    }

    if (route.query.action === "verify_email_error") {
      return t("redirectMessages.verifyEmailError");
    }
  }

  return null;
});
</script>
