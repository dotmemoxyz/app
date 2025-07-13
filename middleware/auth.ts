export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  if (!to.path.startsWith("/manage")) {
    return;
  }

  // Verify the token is valid
  const { verifyToken, logout } = useAuth();
  try {
    const detail = await verifyToken();
    if (!detail) {
      console.warn("Invalid token, redirecting to home");
      // Clear the invalid token using logout function
      logout();
      return navigateTo("/");
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    // Clear the invalid token using logout function
    logout();
    return navigateTo("/");
  }
});
