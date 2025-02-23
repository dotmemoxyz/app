<template>
  <div id="app-base" class="relative flex min-h-screen flex-col bg-background-color">
    <redirect-message />

    <layout-header />
    <main class="h-full p-4 pb-20">
      <slot />
    </main>
    <layout-footer />
  </div>
</template>
