import { createLogger } from "~/utils/create-logger";

export default defineEventHandler(() => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const logger = createLogger("health");
  logger.success("ok");
  return `OK - ${RUNTIME_CONFIG.apiUrl}`;
});
