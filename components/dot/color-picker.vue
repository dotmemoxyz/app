<template>
  <div class="relative">
    <!-- Main component display -->
    <span class="flex w-full cursor-pointer items-center gap-2" @click="toggleColorPicker">
      <!-- Div with color -->
      <span
        class="flex aspect-square h-[50px] items-center justify-center rounded-[12px]"
        :style="{
          backgroundColor: model,
        }"
      />

      <!-- Hidden native color picker (as fallback) -->
      <input ref="inputRef" v-model="model" type="color" class="hidden" @change="hideCustomPicker" />

      <!-- Color as text -->
      <p
        class="flex h-full w-full items-center rounded-[12px] border border-border-default px-4 py-3 text-[14px] font-semibold text-text-primary"
      >
        {{ model ?? placeholder }}
      </p>
    </span>

    <!-- Custom color picker panel -->
    <div
      v-if="isPickerVisible"
      class="absolute z-10 mt-2 rounded-lg border border-border-default bg-surface-card p-4 shadow-lg"
      :style="pickerPosition"
    >
      <!-- Color presets -->
      <div class="mb-3">
        <p class="mb-2 text-sm font-medium text-text-secondary">Presets</p>
        <div class="grid grid-cols-8 gap-2">
          <div
            v-for="color in colorPresets"
            :key="color"
            :style="{ backgroundColor: color }"
            class="hover:ring-primary h-6 w-6 cursor-pointer rounded-md border hover:ring-2"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>

      <!-- Custom color selector -->
      <div>
        <p class="mb-2 text-sm font-medium text-text-secondary">Custom</p>

        <!-- RGB sliders -->
        <div class="space-y-3">
          <div v-for="(channel, index) in ['Red', 'Green', 'Blue']" :key="channel" class="flex items-center">
            <span class="w-16 text-xs text-text-primary">{{ channel }}</span>
            <input
              type="range"
              min="0"
              max="255"
              :value="rgbValues[index]"
              class="w-full"
              @input="updateRGB(index, $event)"
            />
            <span class="ml-2 w-8 text-xs text-text-primary">{{ rgbValues[index] }}</span>
          </div>
        </div>

        <!-- Color preview and hex -->
        <div class="mt-3 flex items-center justify-between gap-2">
          <div class="h-[32px] w-[32px] rounded-md" :style="{ backgroundColor: tempColor }"></div>
          <input
            v-model="model"
            type="text"
            class="flex-1 rounded-lg border border-border-default px-2 py-[6px] text-sm focus:outline-none focus:ring-0"
            @blur="validateHex"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="mt-4 flex justify-end space-x-2">
        <dot-button size="small" class="flex-1" variant="primary" @click="applyColor"> Apply </dot-button>
        <dot-button size="small" class="flex-1" variant="tertiary" @click="hideCustomPicker"> Cancel </dot-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const model = defineModel<string>();
const tempColor = ref(model.value || "#000000");

defineProps<{
  placeholder?: string;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isPickerVisible = ref(false);
const pickerPosition = ref({
  top: "100%",
  left: "0px",
});

// Color management
const rgbValues = ref([0, 0, 0]);

const colorPresets = [
  "#FF6B6B",
  "#FF9E7A",
  "#FFDB7A",
  "#C4F59F",
  "#7AE7C7",
  "#84DFFF",
  "#7AA6FF",
  "#9F7AFF",
  "#FF7AE5",
  "#FF7A9F",
  "#525252",
  "#737373",
  "#A3A3A3",
  "#D4D4D4",
  "#F5F5F5",
  "#000000",
  "#FFFFFF",
];

// Convert hex to RGB
function hexToRgb(hex: string): number[] {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Update RGB values when model changes
watch(
  () => model.value,
  (newValue) => {
    if (newValue && newValue.startsWith("#")) {
      rgbValues.value = hexToRgb(newValue);
      tempColor.value = newValue;
    }
  },
  { immediate: true },
);

// Update RGB slider values
function updateRGB(index: number, event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value);
  rgbValues.value[index] = value;
  tempColor.value = rgbToHex(rgbValues.value[0], rgbValues.value[1], rgbValues.value[2]);
}

// Toggle color picker visibility
function toggleColorPicker() {
  if (!isPickerVisible.value) {
    isPickerVisible.value = true;
    calculatePosition();
  } else {
    hideCustomPicker();
  }
}

// Apply selected color
function applyColor() {
  model.value = tempColor.value;
  hideCustomPicker();
}

// Select a preset color
function selectColor(color: string) {
  tempColor.value = color;
  rgbValues.value = hexToRgb(color);
}

// Validate hex input
function validateHex() {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(tempColor.value)) {
    tempColor.value = model.value || "#000000";
  }
  rgbValues.value = hexToRgb(tempColor.value);
}

// Hide the custom color picker
function hideCustomPicker() {
  isPickerVisible.value = false;
}

// Calculate position for the picker
function calculatePosition() {
  // Wait for next tick to ensure DOM is updated
  setTimeout(() => {
    const element = inputRef.value?.parentElement;
    if (element) {
      const rect = element.getBoundingClientRect();

      // Check if there's enough space below
      const spaceBelow = window.innerHeight - rect.bottom;
      const pickerHeight = 280; // Approximate height of picker

      if (spaceBelow < pickerHeight) {
        // Not enough space below, position above the element
        pickerPosition.value = {
          top: `-${pickerHeight}px`,
          left: "0px",
        };
      } else {
        // Enough space below, position below the element
        pickerPosition.value = {
          top: "100%",
          left: "0px",
        };
      }
    }
  }, 0);
}

// Click outside to close - Fixed implementation
function handleClickOutside(event: MouseEvent) {
  const element = event.target as HTMLElement;
  const colorPickerEl = document.querySelector(".color-picker-panel"); // Add a class to your picker div

  // Only close if click is outside BOTH the input element AND the color picker panel
  if (
    isPickerVisible.value &&
    inputRef.value?.parentElement &&
    !inputRef.value.parentElement.contains(element) &&
    colorPickerEl &&
    !colorPickerEl.contains(element)
  ) {
    hideCustomPicker();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Add any additional styling here */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 5px;
  background: #e0e0e0;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}
</style>
