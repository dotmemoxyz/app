<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <span
      class="relative flex w-full items-center justify-between gap-2 rounded-lg border border-border-default px-4 focus-within:border-accent-primary"
      :class="wrapperClasses"
    >
      <slot name="prefix" class="max-w-20" />
      <input
        v-model="model"
        :placeholder="placeholder"
        :type="props.type ?? 'text'"
        :class="inputClasses"
        :maxlength="limit"
        class="text-text-color min-w-0 flex-1 cursor-pointer appearance-none bg-transparent py-3 placeholder:text-text-placeholder focus:outline-none focus:ring-0"
      />
      <slot name="suffix" />

      <span v-if="Number.isInteger(limit)" class="absolute -top-7 right-0 text-xs text-text-primary">
        {{ model?.toString().length ?? 0 }} / {{ limit }}
      </span>
    </span>
    <span class="mt-1 text-xs font-semibold text-red-500">
      {{ error ?? "&nbsp;" }}
    </span>
  </div>
</template>

<script lang="ts" setup>
const model = defineModel<string | number | Date>({
  set(val: string | Date | number) {
    return props.type === "date" ? new Date(val) : val;
  },
  get(val: string | Date | number) {
    return val instanceof Date ? val.toISOString().split("T").at(0)! : val;
  },
});

const props = defineProps<{
  placeholder?: string;
  error?: string;
  type?: string;
  limit?: number;
}>();

onMounted(() => {
  if (props.type === "date" && !model.value) {
    model.value = new Date();
  }
});

const wrapperClasses = computed(() => {
  if (props.error) {
    return "border-red-500";
  }
  return "border-border-default";
});

const inputClasses = computed(() => {
  if (props.error) {
    return "placeholder:text-red";
  }
  return "placeholder:text-text-primary/60";
});
</script>
