<template>
  <div class="relative flex h-52 w-full overflow-hidden rounded-lg border-2 border-white bg-white/5 md:h-72">
    <template v-if="props.src">
      <img :src="props.src" alt="poap image" class="absolute size-full object-cover opacity-80 blur-2xl" />
      <div class="absolute inset-2 flex items-center justify-center">
        <img :src="props.src" alt="poap image" class="absolute h-full rounded-lg" />
      </div>
    </template>

    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" class="size-full">
      <line
        v-for="n in 30"
        :key="n"
        :x1="(n - 10) * 5 + 1"
        y1="100"
        :x2="(n - 10) * 5 + 40 + 1"
        y2="0"
        stroke="white"
        stroke-width="0.5"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  src?: string;
}>();
</script>
