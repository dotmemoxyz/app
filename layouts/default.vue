<template>
  <div id="app-base" class="relative flex min-h-screen flex-col bg-surface-white pt-[60px]">
    <layout-header />
    <main class="h-full p-4 pb-20">
      <slot />
    </main>
    <layout-footer />
  </div>
</template>
