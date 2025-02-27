<template>
  <div id="app-base" class="relative flex min-h-screen flex-col bg-surface-white pt-[60px]">
    <layout-header />
    <main class="h-full p-4 px-[16px] pb-20 md:px-[160px]">
      <slot />
    </main>
    <layout-footer />
  </div>
</template>
