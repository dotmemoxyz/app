<template>
  <div class="relative flex h-52 w-full overflow-hidden rounded-lg border border-white bg-white/5 p-2 md:h-72">
    <img :src="props.src" alt="poap image" class="absolute size-full object-cover opacity-80 blur-2xl" />
    <div class="absolute inset-2 flex items-center justify-center">
      <img :src="props.src" alt="poap image" class="absolute h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string;
}>();
</script>
