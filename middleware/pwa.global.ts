export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;
  if (to.path === "/") {
    return;
  }
  const { $pwa } = useNuxtApp();
  if ($pwa?.isPWAInstalled && !navigator.onLine) {
    return navigateTo("/");
  }
});
