import consola from "consola";

export const createLogger = (scope?: string) => consola.create({ defaults: { tag: scope } });
