<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex w-full gap-4">
      <div class="flex items-center gap-4 rounded-xl bg-[#F9F9F9] p-4">
        <div class="size-51 flex items-center justify-center rounded-lg bg-[#55F39A] p-3">
          <Icon name="memo:people" class="size-[22px] text-black" />
        </div>
        <div class="flex flex-col justify-between">
          <h3 class="text-[20px] !text-black">30</h3>
          <p class="text-[14px] !text-[#606060]">{{ $t("manage.analytics.totalClaims") }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4 rounded-xl bg-[#F9F9F9] p-4">
        <div class="size-51 flex items-center justify-center rounded-lg bg-white p-3">
          <Icon name="memo:fingerprint" class="size-[22px] text-black" />
        </div>
        <div class="flex flex-col justify-between">
          <h3 class="text-[20px] !text-black">14</h3>
          <p class="text-[14px] !text-[#606060]">{{ $t("manage.analytics.uniqueAddresses") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
