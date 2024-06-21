<template>
  <div class="flex flex-col p-4">
    <h1 class="text-4xl">Welcome to .POAP</h1>
    <h2 class="text-xl">POAP is your way to happiness!</h2>
    <dot-card class="bg-accent mt-4">
      <select v-model="colorMode.preference">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="sepia">Sepia</option>
      </select>
      <dot-modal />
      <test-poap />
    </dot-card>
  </div>
</template>
<script setup lang="ts">
const colorMode = useColorMode();
</script>
