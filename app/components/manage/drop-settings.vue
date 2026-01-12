<template>
  <div class="flex flex-col">
    <!-- Distribution Settings -->
    <manage-drop-distribution-settings :drop="drop" />

    <hr class="mx-4 max-w-md border-border-default" />

    <!-- Rarity Settings -->
    <manage-drop-rarity :drop="drop" />

    <hr class="mx-4 max-w-md border-border-default" />

    <!-- Organizers -->
    <manage-drop-organizers :drop="drop" />

    <hr class="mx-4 max-w-md border-border-default" />

    <!-- Location Restriction -->
    <manage-drop-location :drop="drop" @saved="$emit('saved')" />
  </div>
</template>

<script lang="ts" setup>
import type { MemoDetail } from "~/types/memo";

defineEmits<{
  (e: "saved"): void;
}>();

defineProps<{
  drop: MemoDetail;
}>();
</script>
