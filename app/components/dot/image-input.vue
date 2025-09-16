<template>
  <div>
    <input
      :id="imageInputId"
      hidden
      type="file"
      accept="image/jpeg, image/png, image/gif, image/tiff, image/webp"
      @change="previewImage"
    />

    <label :for="imageInputId">
      <div
        class="border-background-color-inverse hover:border-background-color-inverse hover:shadow-background-color-inverse group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-dashed"
      >
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <template v-if="previewImageSrc">
            <img
              :src="previewImageSrc"
              alt="submitted image preview"
              class="pointer-events-none m-2 aspect-square flex-1 overflow-hidden rounded-md object-cover"
            />

            <div
              class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-lg transition-opacity group-hover:opacity-100"
            >
              <h1 class="px-4 text-center text-accent-primary">{{ t("create.image.chooseDifferent") }}</h1>
            </div>
          </template>

          <template v-else>
            <p class="mt-2 text-center font-bold">{{ t("create.image.chooseArtwork") }}</p>
          </template>
        </div>
      </div>
    </label>
    <span class="mt-0.5 text-xs font-semibold text-red-500">
      {{ error ?? "&nbsp;" }}
    </span>
  </div>
</template>

<script lang="ts" setup>
const imageInputId = useId();
const model = defineModel<File>();
const { t } = useI18n();

defineProps<{
  error?: string;
}>();

const previewImageSrc = ref("");

function previewImage(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];

  if (!file) {
    return;
  }

  model.value = file;

  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    previewImageSrc.value = String(e.target?.result) || "";
  };
  fileReader.readAsDataURL(file);
}
</script>
