<template>
  <Story title="Dot/Button" auto-props-disabled>
    <Variant title="Default">
      <dot-button
        class="mb-5 w-1/2"
        :disabled="state.disabled"
        :variant="state.variant"
        :size="state.size"
        @click="logEvent('Click!', $event)"
      >
        {{ state.content }}
      </dot-button>
    </Variant>
    <Variant title="With icon">
      <dot-button class="mb-5 w-1/2" :disabled="state.disabled" :size="state.size" :variant="state.variant">
        {{ state.content }}
        <template #icon>
          <icon name="mdi:chevron-double-down" size="24" />
        </template>
      </dot-button>
    </Variant>
    <template #controls>
      <HstText v-model="state.content" title="Content" />
      <HstSelect
        v-model="state.variant"
        title="Variant"
        :options="['primary-shadow', 'secondary-shadow', 'primary', 'secondary', 'primary', 'secondary']"
      />
      <HstSelect v-model="state.size" title="Size" :options="['small', 'medium', 'large']" />
      <HstCheckbox v-model="state.disabled" title="Disabled" />
    </template>
  </Story>
</template>

<docs lang="md">
# Button documentation

This is a button component.

## Slots

- `default`: The button content.

## Props

- `disabled`: Disables the button.
- `variant`: The button variant.
- `size`: The button size.

## Events

- `click`: Emitted when the button is clicked.
</docs>

<script lang="ts" setup>
import { logEvent } from "histoire/client";
import type { BtnSize, BtnVariant } from "./types";

const state = reactive({
  content: "Hello",
  variant: "primary" as BtnVariant,
  size: "small" as BtnSize,
  disabled: false,
});
</script>
