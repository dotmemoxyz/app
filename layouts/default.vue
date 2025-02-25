<template>
  <div id="app-base" class="relative flex min-h-screen flex-col bg-background pt-10">
    <layout-header />
    <main class="h-full p-4 pb-20">
      <slot />
    </main>
    <layout-footer />
  </div>
</template>
