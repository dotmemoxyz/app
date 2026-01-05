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
  </div>
</template>

<script lang="ts" setup>
import type { MemoWithCode } from "~/types/memo";

defineProps<{
  drop: MemoWithCode;
}>();
</script>
