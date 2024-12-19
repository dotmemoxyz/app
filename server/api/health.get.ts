import { createLogger } from "~~/utils/create-logger";

const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(() => {
  const logger = createLogger("health");
  logger.success("ok");
  return `OK - ${RUNTIME_CONFIG.apiUrl}`;
});
