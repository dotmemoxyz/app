<template>
  <div class="flex h-full flex-col items-center justify-center">
    <div v-if="status === 'pending'">
      <Spinner />
    </div>
    <div v-else-if="status === 'error'">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="status === 'success'">
      <div v-if="!data">
        <p>No drops found</p>
      </div>
      <div v-else class="flex w-full flex-col items-center">
        <div class="flex items-center gap-2">
          <Icon name="mdi:calendar" size="24" class="text-k-primary" />
          <p>
            {{ DateTime.fromSQL(data.createdAt).toLocaleString(DateTime.DATE_FULL) }}
          </p>
          <p>-</p>
          <Icon name="mdi:calendar" size="24" class="text-k-primary" />
          <p>
            {{ DateTime.fromSQL(data.expiresAt).toLocaleString(DateTime.DATE_FULL) }}
          </p>
        </div>
        <div v-if="data.description" class="flex items-center gap-2">
          <Icon name="mdi:text" size="24" class="text-k-primary" />
          <p>
            {{ data.description }}
          </p>
        </div>
        <div class="flex w-full justify-center">
          <small class="text-gray-400 dark:text-white">
            {{
              $t("claim.remaining", {
                free: remaining,
                total: maxMints,
              })
            }}
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from "@kodadot1/static";
import { DateTime } from "luxon";
import { getFreeMints } from "~/utils/sdk/query";

const route = useRoute();
const { data, status, error } = await useFetch("/api/code", {
  query: { code: route.params.code },
  watch: false,
});
const maxMints = ref(0);
const minted = ref(0);
const remaining = ref(0);
const { apiInstanceByPrefix } = useApi(toRef<Prefix>("ahp"));
const loadingLimitInfo = ref(true);
watch(
  data,
  async (data) => {
    if (data) {
      loadingLimitInfo.value = true;
      const api = await apiInstanceByPrefix(data.chain);
      const { maxTokens, mintedTokens, remainingMints } = await getFreeMints(api, data.collection);
      maxMints.value = maxTokens;
      minted.value = mintedTokens;
      remaining.value = remainingMints;
      loadingLimitInfo.value = false;
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<style></style>
