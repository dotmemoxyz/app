<template>
  <Story title="Dot/Switch" auto-props-disabled>
    <Variant title="Default">
      <dot-switch v-model="state.check" :disabled="state.disabled" />
    </Variant>
    <template #controls>
      <HstCheckbox v-model="state.check" title="Checked" />
      <HstCheckbox v-model="state.disabled" title="Disabled" />
    </template>
  </Story>
</template>

<script lang="ts" setup>
const state = reactive({
  check: false,
  disabled: false,
});
</script>
