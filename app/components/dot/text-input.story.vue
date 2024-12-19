<template>
  <Story title="Dot/Text-Input" auto-props-disabled>
    <Variant title="Default">
      <dot-label class="w-1/4" text="Text input" :error="state.error">
        <dot-text-input v-model="state.content" placeholder="Placeholder..." :error="state.error" />
      </dot-label>
    </Variant>
    <Variant title="With prefix">
      <dot-label class="w-1/4" text="Text input" :error="state.error">
        <dot-text-input v-model="state.content" placeholder="Placeholder..." :error="state.error">
          <template #prefix>
            <Icon name="mdi:search-web" class="text-k-grey" size="24" />
          </template>
        </dot-text-input>
      </dot-label>
    </Variant>
    <Variant title="With suffix">
      <dot-label class="w-1/4" text="Text input" :error="state.error">
        <dot-text-input v-model="state.content" placeholder="Placeholder..." :error="state.error">
          <template #suffix>
            <Icon name="mdi:eye" class="text-k-grey" size="24" />
          </template>
        </dot-text-input>
      </dot-label>
    </Variant>
    <Variant title="With prefix & suffix">
      <dot-label class="w-1/4" text="Text input" :error="state.error">
        <dot-text-input v-model="state.content" placeholder="Placeholder..." :error="state.error">
          <template #prefix>
            <Icon name="mdi:search-web" class="text-k-grey" size="24" />
          </template>
          <template #suffix>
            <Icon name="mdi:eye" class="text-k-grey" size="24" />
          </template>
        </dot-text-input>
      </dot-label>
    </Variant>
    <template #controls>
      <HstText v-model="state.content" title="Content" />
      <HstCheckbox v-model="state.error" title="Error" />
    </template>
  </Story>
</template>

<script lang="ts" setup>
const state = reactive({
  content: "",
  error: false,
});
</script>
