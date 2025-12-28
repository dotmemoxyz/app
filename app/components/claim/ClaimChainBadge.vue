<template>
  <div class="flex w-full items-center justify-center gap-2">
    <small class="text-md dark:text-white">{{ t("claim.claimFree") }} @{{ getChainName(chain) }}</small>
    <img :src="`/chain/${chain}.webp`" alt="chain" class="max-h-6 max-w-6 rounded-full" />
  </div>
</template>

<script setup lang="ts">
import type { Prefix } from "@kodadot1/static";

const { t } = useI18n();

defineProps<{
  chain: Prefix;
}>();
</script>
