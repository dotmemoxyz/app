import type { Prefix } from "@kodadot1/static";

export default function () {
  const config = useRuntimeConfig();
  const prefix = computed<Prefix>(() => config.public.chain as Prefix);

  return {
    prefix,
  };
}
