export default defineNuxtPlugin(() => {
  const accountStore = useAccountStore();

  // Initialize token from cookie on app start
  accountStore.initializeToken();
});
