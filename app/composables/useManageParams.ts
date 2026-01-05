import type { Ownership } from "~/types/memo";
import type { Prefix } from "@kodadot1/uniquery";

export const useManageParams = () => {
  const route = useRoute();
  const router = useRouter();

  const ownership = computed<Ownership>({
    get: () => {
      const param = route.query.ownership as string;
      if (["created", "organized", "collected"].includes(param)) {
        return param as Ownership;
      }
      return "created";
    },
    set: (value: Ownership) => {
      router.push({
        query: {
          ...route.query,
          ownership: value,
        },
      });
    },
  });

  const chain = computed<Prefix>({
    get: () => {
      const param = route.query.chain as string;
      if (["ahp", "ahk"].includes(param)) {
        return param as Prefix;
      }
      return "ahp";
    },
    set: (value: Prefix) => {
      router.push({
        query: {
          ...route.query,
          chain: value,
        },
      });
    },
  });

  return { ownership, chain };
};
