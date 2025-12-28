<template>
  <div class="flex flex-col items-center gap-4">
    <Icon name="mdi:alert-circle-outline" size="64" class="text-red-500" />
    <h2 class="text-xl font-medium text-text-primary">{{ $t("claim.cantLoad") }}</h2>
    <dot-button variant="tertiary" @click="$router.push('/claim')">
      {{ $t("claim.tryDifferent") }}
    </dot-button>
  </div>
</template>
