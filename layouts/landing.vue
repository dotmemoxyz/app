<template>
  <div id="app-base" class="relative min-h-screen bg-bg-persistent">
    <redirect-message />

    <main class="h-full pb-20">
      <slot />
    </main>
    <layout-footer />
  </div>
</template>
