<template>
  <component :is="component" v-bind="componentProps" />
</template>

<script setup lang="ts">
import type { Prefix } from "@polkadot/util-crypto/address/types";
import { encodeAccount } from "@polkadot/vue-identicon/Identicon";
import { Beachball, Empty, Jdenticon, Polkadot } from "@polkadot/vue-identicon/icons";

type Theme = "beachball" | "empty" | "jdenticon" | "polkadot" | "substrate";

const DEFAULT_SIZE = 64;

// Wrapper avoids Vue 3 slot warning from @polkadot/vue-identicon while keeping typed props.
const props = withDefaults(
  defineProps<{
    address: string | Uint8Array;
    accountPrefix?: Prefix;
    size?: number;
    theme?: Theme;
  }>(),
  {
    theme: "empty",
    accountPrefix: undefined,
    size: DEFAULT_SIZE,
  },
);

const iconSize = computed(() => props.size ?? DEFAULT_SIZE);

const component = computed(() => {
  switch (props.theme) {
    case "empty":
      return Empty;
    case "jdenticon":
      return Jdenticon;
    case "beachball":
      return Beachball;
    case "polkadot":
      return Polkadot;
    case "substrate":
      throw new Error("substrate type is not supported");
    default:
      return Empty;
  }
});

const componentProps = computed(() => {
  const account = encodeAccount(props.address, props.accountPrefix);

  if (props.theme === "jdenticon") {
    return {
      publicKey: account.publicKey,
      size: iconSize.value,
    };
  }

  if (props.theme === "beachball" || props.theme === "polkadot") {
    return {
      address: account.address,
      size: iconSize.value,
    };
  }

  return {
    size: iconSize.value,
  };
});
</script>
