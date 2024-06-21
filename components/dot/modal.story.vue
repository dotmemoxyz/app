<script setup lang="ts">
import { ModalsContainer } from "vue-final-modal";
</script>

<template>
  <Story title="Dot/Modal" auto-props-disabled>
    <Variant title="Default">
      <div
        class="my-2 flex w-2/3 flex-col border border-background-color-inverse bg-k-yellow p-4"
      >
        <h2 class="font-bold">Disclaimer!</h2>
        <p>This doesn't work in <u>histoire</u> environment</p>
      </div>
      <dot-modal />
      <ModalsContainer />
    </Variant>
  </Story>
</template>
