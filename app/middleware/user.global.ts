import { createLogger } from "~~/utils/create-logger";

const logger = createLogger("middleware:user.global");
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;
  const accountStore = useAccountStore();
  if (accountStore.hasSelectedAccount) {
    return;
  }
  const account = localStorage.getItem("account");
  if (account) {
    try {
      accountStore.selectAccount(JSON.parse(account));
    } catch (e) {
      logger.error(e);
    }
  }
});
