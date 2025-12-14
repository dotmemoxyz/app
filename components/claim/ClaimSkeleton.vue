<template>
  <div class="flex flex-col items-center gap-[32px]">
    <!-- Image -->
    <dot-skeleton class="h-[300px] w-[300px] rounded-[16px]" />

    <!-- Title and description -->
    <div class="flex flex-col items-center gap-[24px]">
      <dot-skeleton class="h-8 w-48 rounded" />
      <dot-skeleton class="h-6 w-64 rounded" />
    </div>

    <!-- Metadata -->
    <div class="flex w-full flex-col gap-[12px]">
      <dot-skeleton class="h-5 w-full rounded" />
      <dot-skeleton class="h-5 w-full rounded" />
    </div>

    <!-- Social links -->
    <div class="flex gap-[8px]">
      <dot-skeleton class="h-10 w-10 rounded-full" />
      <dot-skeleton class="h-10 w-10 rounded-full" />
      <dot-skeleton class="h-10 w-10 rounded-full" />
    </div>

    <!-- Claim button -->
    <div class="flex w-full flex-col space-y-[16px]">
      <dot-skeleton class="h-12 w-full rounded-[12px]" />
      <dot-skeleton class="h-8 w-32 self-center rounded" />
    </div>
  </div>
</template>
