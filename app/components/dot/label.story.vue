<template>
  <Story title="Dot/Label" auto-props-disabled>
    <Variant title="Default">
      <dot-label class="w-1/4" text="Switch" :required="state.required" :vertical="state.vertical" :error="state.error">
        <dot-switch />
      </dot-label>
    </Variant>
    <template #controls>
      <HstCheckbox v-model="state.required" title="Required" />
      <HstCheckbox v-model="state.vertical" title="Vertical" />
      <HstCheckbox v-model="state.error" title="Error" />
    </template>
  </Story>
</template>

<script lang="ts" setup>
const state = reactive({
  required: false,
  vertical: false,
  error: false,
});
</script>
